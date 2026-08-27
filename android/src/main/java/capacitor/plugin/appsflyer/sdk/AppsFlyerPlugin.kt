package capacitor.plugin.appsflyer.sdk

import com.appsflyer.pluginbridge.handler.AppsFlyerRpcHandler
import com.appsflyer.pluginbridge.model.RpcResponse
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import org.json.JSONObject
import java.util.concurrent.Executors

private const val RPC_EVENT_NAME = "rpcEvent"
private const val DEEP_LINK_EVENT_NAME = "onDeepLinking"

// Normalizes Android's SHOUTING_CASE status to the canonical lowerCamelCase vocabulary
// js-core-plugin's DeepLinkData expects; `error` has no separate canonical form, just lowercased.
private val ANDROID_TO_CANONICAL_DEEP_LINK_STATUS: Map<String, String> = mapOf(
    "FOUND" to "found",
    "NOT_FOUND" to "notFound",
    "ERROR" to "failure",
)

// Methods touching AppsFlyerRpcHandler's unsynchronized listener fields — routed to the FIFO
// lane, not the pool, so registration/unregistration calls can't race each other.
private val LISTENER_LIFECYCLE_METHODS: Set<String> = setOf(
    "init",
    "registerConversionListener", "unregisterConversionListener",
    "registerSessionReadyListener", "unregisterSessionReadyListener",
    "subscribeForDeepLink", "unsubscribeForDeepLink",
)

// Shared by every JSON helper below — best-effort parse, `default` instead of throwing.
private inline fun <T> parseJsonOrDefault(json: String, default: T, block: (JSONObject) -> T): T {
    return try {
        block(JSONObject(json))
    } catch (e: Exception) {
        default
    }
}

// Top-level so these are unit-testable without a Capacitor Bridge/PluginCall instance.
internal fun isListenerLifecycleCall(requestJson: String): Boolean = parseJsonOrDefault(requestJson, false) { request ->
    request.optString("method") in LISTENER_LIFECYCLE_METHODS
}

internal fun normalizeDeepLinkEvent(eventJson: String): String = parseJsonOrDefault(eventJson, eventJson) { envelope ->
    if (envelope.optString("event") != DEEP_LINK_EVENT_NAME) return@parseJsonOrDefault eventJson
    val data = envelope.optJSONObject("data") ?: return@parseJsonOrDefault eventJson

    data.optString("status").takeIf { it.isNotEmpty() }?.let { raw ->
        data.put("status", ANDROID_TO_CANONICAL_DEEP_LINK_STATUS[raw] ?: raw)
    }
    data.optString("error").takeIf { it.isNotEmpty() }?.let { data.put("error", it.lowercase()) }

    envelope.toString()
}

/** Capacitor bridge — every SDK capability is dispatched via executeRpc -> AppsFlyerRpcHandler. */
@CapacitorPlugin(name = "AppsFlyerPlugin")
class AppsFlyerPlugin : Plugin() {

    // FIFO — the listener-lifecycle methods need strict ordering, not just eventual execution.
    private val listenerExecutor = Executors.newSingleThreadExecutor()

    // Stateless passthroughs run concurrently here so a slow call (start/logEvent) doesn't
    // head-of-line-block a fast one.
    private val rpcExecutor = Executors.newFixedThreadPool(4)

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
            call.reject("requestJson is required")
            return
        }
        val executor = if (isListenerLifecycleCall(requestJson)) listenerExecutor else rpcExecutor
        executor.execute {
            val responseJson = safeDispatchToNative(requestJson)
            val result = JSObject()
            result.put("responseJson", responseJson)
            call.resolve(result)
        }
    }

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        listenerExecutor.shutdown()
        rpcExecutor.shutdown()
    }

    // Catches vendored AppsFlyerRpcHandler exceptions here so they fail the call instead of
    // crashing the process.
    private fun safeDispatchToNative(requestJson: String): String {
        return try {
            normalize(rpcHandler.execute(requestJson))
        } catch (e: Exception) {
            normalizeError(code = 500, message = e.message ?: "Unexpected native RPC failure")
        }
    }

    // Must match the { success, data|error } envelope iOS's bridge also emits — keep in sync.
    private fun normalize(response: RpcResponse): String {
        val normalized = JSONObject()
        when (response) {
            is RpcResponse.Success<*> -> {
                normalized.put("success", true)
                normalized.put("data", response.result)
            }
            is RpcResponse.VoidSuccess -> {
                normalized.put("success", true)
                normalized.put("data", JSONObject.NULL)
            }
            is RpcResponse.Error -> {
                val error = JSONObject()
                error.put("code", response.code)
                error.put("message", response.message)
                normalized.put("success", false)
                normalized.put("error", error)
            }
        }
        return normalized.toString()
    }

    private fun normalizeError(code: Int, message: String): String {
        val error = JSONObject()
        error.put("code", code)
        error.put("message", message)
        val normalized = JSONObject()
        normalized.put("success", false)
        normalized.put("error", error)
        return normalized.toString()
    }
}
