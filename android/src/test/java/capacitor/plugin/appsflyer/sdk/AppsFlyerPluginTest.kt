package capacitor.plugin.appsflyer.sdk

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class AppsFlyerPluginTest {

    @Test
    fun `isListenerLifecycleCall is true for init`() {
        assertTrue(isListenerLifecycleCall("""{"method":"init","params":{}}"""))
    }

    @Test
    fun `isListenerLifecycleCall is false for logEvent`() {
        assertFalse(isListenerLifecycleCall("""{"method":"logEvent","params":{}}"""))
    }

    @Test
    fun `isListenerLifecycleCall is false for malformed json`() {
        assertFalse(isListenerLifecycleCall("not json"))
    }

    @Test
    fun `normalizeDeepLinkEvent maps FOUND to found`() {
        val input = """{"event":"onDeepLinking","data":{"status":"FOUND"}}"""
        val output = normalizeDeepLinkEvent(input)
        assertTrue(output.contains("\"status\":\"found\""))
    }

    @Test
    fun `normalizeDeepLinkEvent leaves non-deep-link events untouched`() {
        val input = """{"event":"onConversionDataSuccess","data":{"af_status":"Organic"}}"""
        assertEquals(input, normalizeDeepLinkEvent(input))
    }
}
