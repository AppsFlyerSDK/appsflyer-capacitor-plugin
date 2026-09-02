package capacitor.plugin.appsflyer.sdk

import android.Manifest
import android.util.Log
import com.appsflyer.pluginbridge.handler.AppsFlyerRpcHandler
import com.appsflyer.pluginbridge.model.RpcResponse
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import org.json.JSONObject
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.RejectedExecutionException
import java.util.concurrent.TimeUnit

private const val RPC_EVENT_NAME = "rpcEvent"
private const val DEEP_LINK_EVENT_NAME = "onDeepLinking"

// Wire method names whose native handler blocks the calling thread on an async response -- optionally via an "awaitResponse" param, or always for validateAndLogInAppPurchase (no such param; its promise needs the store-validation round trip). Own lane avoids head-of-line-blocking rpcExecutor.
private val AWAIT_RESPONSE_METHODS: Set<String> = setOf(
    "start", "logEvent", "generateInviteLink", "validateAndLogInAppPurchase",
)

// internal (not private) + top-level so AppsFlyerPluginTest can call this directly.
internal fun isAwaitResponseCall(requestJson: String): Boolean =
    parseJsonOrDefault(requestJson, default = false) { it.optString("method") in AWAIT_RESPONSE_METHODS }

// Shared by every JSON helper below — best-effort parse, `default` instead of throwing.
private inline fun <T> parseJsonOrDefault(json: String, default: T, block: (JSONObject) -> T): T {
    return try {
        block(JSONObject(json))
    } catch (e: Exception) {
        // Don't log `json` itself — it can be a deep-link event carrying a URL with PII query params.
        Log.w("AppsFlyerPlugin", "Failed to parse RPC event JSON, passing through unmodified", e)
        default
    }
}

// `status` is left as-is — js-core-plugin's normalizeDeepLinkStatus() already re-normalizes it for every consumer; duplicating that here would just drift out of sync.
internal fun normalizeDeepLinkEvent(eventJson: String): String = parseJsonOrDefault(eventJson, eventJson) { envelope ->
    if (envelope.optString("event") != DEEP_LINK_EVENT_NAME) return@parseJsonOrDefault eventJson
    val data = envelope.optJSONObject("data") ?: return@parseJsonOrDefault eventJson

    // Copy instead of mutating `data` in place — pluginNotifier fires from arbitrary native threads and `data` is owned by `envelope`, not this function.
    val error = data.optString("error").takeIf { it.isNotEmpty() }?.lowercase()
    if (error != null) {
        val copy = JSONObject(data.toString())
        copy.put("error", error)
        envelope.put("data", copy)
    }

    envelope.toString()
}

/** Capacitor bridge — every SDK capability is dispatched via executeRpc -> AppsFlyerRpcHandler. */
@CapacitorPlugin(
    name = "AppsFlyerPlugin",
    permissions = [Permission(
        strings = arrayOf(
            Manifest.permission.INTERNET,
            Manifest.permission.ACCESS_NETWORK_STATE,
            "com.google.android.gms.permission.AD_ID"
        )
    )]
)
class AppsFlyerPlugin : Plugin() {

    // rpcExecutor single-threaded: AppsFlyerRpcHandler's listener fields are unsynchronized `var`s, so pooling it could race registration against dispatch. awaitResponseExecutor is pooled, sized to AWAIT_RESPONSE_METHODS, so its methods don't block each other while still isolated from general RPC dispatch.
    private val awaitResponseExecutor = Executors.newFixedThreadPool(AWAIT_RESPONSE_METHODS.size)
    private val rpcExecutor = Executors.newSingleThreadExecutor()

    private val rpcHandler by lazy {
        AppsFlyerRpcHandler(
            contextProvider = { activity ?: context },
            pluginNotifier = { rawEventJson ->
                val payload = JSObject()
                payload.put("envelopeJson", normalizeDeepLinkEvent(rawEventJson))
                notifyListeners(RPC_EVENT_NAME, payload)
            },
        )
    }

    @PluginMethod
    fun executeRpc(call: PluginCall) {
        val requestJson = call.getString("requestJson")
        if (requestJson == null) {
            call.reject("requestJson is required", "INVALID_REQUEST")
            return
        }
        val executor = if (isAwaitResponseCall(requestJson)) awaitResponseExecutor else rpcExecutor
        dispatch(call, executor, requestJson)
    }

    private fun dispatch(call: PluginCall, executor: ExecutorService, requestJson: String) {
        try {
            executor.execute {
                // Never let an exception escape the task: uncaught, it hits this worker thread's default UncaughtExceptionHandler and kills the whole process on Android.
                try {
                    val responseJson = safeDispatchToNative(requestJson)
                    val result = JSObject()
                    result.put("responseJson", responseJson)
                    call.resolve(result)
                } catch (e: Exception) {
                    call.reject("Unexpected RPC dispatch failure: ${e.message}", "NATIVE_DISPATCH_ERROR", e)
                }
            }
        } catch (e: RejectedExecutionException) {
            call.reject("Plugin is shutting down", "PLUGIN_SHUTTING_DOWN")
        }
    }

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        // shutdownNow (not shutdown): don't run queued calls against a torn-down bridge/activity; awaitTermination bounds the wait so onDestroy can't hang on a stuck task.
        for (executor in listOf(awaitResponseExecutor, rpcExecutor)) {
            executor.shutdownNow()
        }
        try {
            awaitResponseExecutor.awaitTermination(2, TimeUnit.SECONDS)
            rpcExecutor.awaitTermination(2, TimeUnit.SECONDS)
        } catch (e: InterruptedException) {
            Thread.currentThread().interrupt()
        }
    }

    // Catches AppsFlyerRpcHandler exceptions here so they fail the call instead of crashing the process; never forwards the exception message to JS since it can contain internal class names/paths (CWE-209).
    private fun safeDispatchToNative(requestJson: String): String {
        return try {
            normalize(rpcHandler.execute(requestJson))
        } catch (e: Exception) {
            // Don't log `requestJson` — same PII risk as parseJsonOrDefault above (e.g. a performDeepLinking call carries a URL with PII query params).
            Log.w("AppsFlyerPlugin", "Native RPC dispatch failed", e)
            normalizeError(code = 500, message = "Unexpected native RPC failure")
        }
    }
}

// internal (not private) + top-level so AppsFlyerPluginTest can call these directly without instantiating a Plugin(); must match the { success, data|error } envelope iOS's bridge also emits — keep in sync with AppsFlyerPluginTests.swift.
internal fun normalize(response: RpcResponse): String {
    val normalized = JSONObject()
    when (response) {
        is RpcResponse.Success<*> -> {
            normalized.put("success", true)
            // wrap() also covers a future result type that isn't a Map/Collection, falling back to JSONObject.NULL instead of a stringified blob.
            normalized.put("data", JSONObject.wrap(response.result) ?: JSONObject.NULL)
        }
        is RpcResponse.VoidSuccess -> {
            normalized.put("success", true)
            normalized.put("data", JSONObject.NULL)
        }
        is RpcResponse.Error -> return normalizeError(code = response.code, message = response.message)
    }
    return normalized.toString()
}

internal fun normalizeError(code: Int, message: String): String {
    val error = JSONObject()
    error.put("code", code)
    error.put("message", message)
    val normalized = JSONObject()
    normalized.put("success", false)
    normalized.put("error", error)
    return normalized.toString()
}
