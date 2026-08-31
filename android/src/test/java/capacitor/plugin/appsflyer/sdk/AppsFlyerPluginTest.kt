package capacitor.plugin.appsflyer.sdk

import com.appsflyer.pluginbridge.model.RpcResponse
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class AppsFlyerPluginTest {

    // Same three cases as AppsFlyerPluginTests.swift's envelope-parity tests — keep in sync; proves both platforms emit an identical { success, data|error } shape despite differently-shaped raw input.

    @Test
    fun `normalize matches iOS envelope for a successful result with data`() {
        val json = normalize(RpcResponse.Success(mapOf("uid" to "abc")))
        assertEquals(JSONObject("""{"success":true,"data":{"uid":"abc"}}""").toString(), JSONObject(json).toString())
    }

    @Test
    fun `normalize matches iOS envelope for a void success`() {
        val json = normalize(RpcResponse.VoidSuccess)
        assertEquals(JSONObject("""{"success":true,"data":null}""").toString(), JSONObject(json).toString())
    }

    @Test
    fun `normalize matches iOS envelope for a protocol error`() {
        val json = normalize(RpcResponse.Error(code = 404, message = "not found"))
        assertEquals(
            JSONObject("""{"success":false,"error":{"code":404,"message":"not found"}}""").toString(),
            JSONObject(json).toString(),
        )
    }

    @Test
    fun `normalizeDeepLinkEvent leaves status untouched — js-core-plugin owns that normalization`() {
        val input = """{"event":"onDeepLinking","data":{"status":"FOUND"}}"""
        val output = normalizeDeepLinkEvent(input)
        assertTrue(output.contains("\"status\":\"FOUND\""))
    }

    @Test
    fun `normalizeDeepLinkEvent leaves non-deep-link events untouched`() {
        val input = """{"event":"onConversionDataSuccess","data":{"af_status":"Organic"}}"""
        assertEquals(input, normalizeDeepLinkEvent(input))
    }

    @Test
    fun `normalizeDeepLinkEvent lowercases the error field`() {
        val input = """{"event":"onDeepLinking","data":{"status":"ERROR","error":"NETWORK_TIMEOUT"}}"""
        val output = normalizeDeepLinkEvent(input)
        assertTrue(output.contains("\"error\":\"network_timeout\""))
    }

    @Test
    fun `normalizeDeepLinkEvent leaves event untouched when data is missing`() {
        val input = """{"event":"onDeepLinking"}"""
        assertEquals(input, normalizeDeepLinkEvent(input))
    }

    @Test
    fun `isListenerLifecycleCall is true for init and listener registration methods`() {
        assertTrue(isListenerLifecycleCall("""{"method":"init","params":{}}"""))
        assertTrue(isListenerLifecycleCall("""{"method":"registerConversionListener","params":{}}"""))
        // "subscribeForDeepLink" is the Android wire name for the public registerDeepLinkListener API.
        assertTrue(isListenerLifecycleCall("""{"method":"subscribeForDeepLink","params":{}}"""))
    }

    @Test
    fun `isListenerLifecycleCall is false for general RPC methods`() {
        assertFalse(isListenerLifecycleCall("""{"method":"logEvent","params":{}}"""))
        assertFalse(isListenerLifecycleCall("""{"method":"performDeepLinking","params":{}}"""))
    }

    @Test
    fun `isAwaitResponseCall is true for methods that block on a native async response`() {
        assertTrue(isAwaitResponseCall("""{"method":"start","params":{}}"""))
        assertTrue(isAwaitResponseCall("""{"method":"logEvent","params":{}}"""))
        assertTrue(isAwaitResponseCall("""{"method":"generateInviteLink","params":{}}"""))
        // No "awaitResponse" param exists for this one -- it's always blocking, see AWAIT_RESPONSE_METHODS comment.
        assertTrue(isAwaitResponseCall("""{"method":"validateAndLogInAppPurchase","params":{}}"""))
    }

    @Test
    fun `isAwaitResponseCall is false for fire-and-forget RPC methods`() {
        assertFalse(isAwaitResponseCall("""{"method":"setCustomerUserId","params":{}}"""))
        assertFalse(isAwaitResponseCall("""{"method":"performDeepLinking","params":{}}"""))
    }
}
