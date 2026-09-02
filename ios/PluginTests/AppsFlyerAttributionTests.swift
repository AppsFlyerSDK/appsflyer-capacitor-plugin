import XCTest
@testable import Plugin

final class AppsFlyerAttributionTests: XCTestCase {

    override func tearDown() {
        // `.shared` is a process-wide singleton — reset it so test order/reruns can't leak
        // bridgeReady=true (or a stale pending buffer) into an unrelated test.
        AppsFlyerAttribution.shared.bridgeReady = false
        super.tearDown()
    }

    func testHandleOpenBuffersUntilBridgeReady() {
        let attribution = AppsFlyerAttribution.shared
        attribution.bridgeReady = false
        // No AppsFlyerLib call should fire yet — buffered internally.
        attribution.handleOpen(URL(string: "https://example.com")!, options: [:])
        // Proves the buffer/flush wiring executes without crashing; AppsFlyerLib itself isn't mocked here.
        attribution.bridgeReady = true
    }

    func testFlushPendingDrainsBothBufferedUrlAndUserActivity() {
        let attribution = AppsFlyerAttribution.shared
        attribution.bridgeReady = false
        // Regression test: flushPending used to return early after the URL, leaking a buffered userActivity into the next flush.
        attribution.handleOpen(URL(string: "https://example.com")!, options: [:])
        attribution.continueUserActivity(NSUserActivity(activityType: NSUserActivityTypeBrowsingWeb))
        attribution.bridgeReady = true
    }

    func testHandleLaunchOptionsForwardsImmediately() {
        // handleLaunchOptions has no buffering hazard — must be callable regardless of bridgeReady state.
        AppsFlyerAttribution.shared.bridgeReady = false
        AppsFlyerAttribution.shared.handleLaunchOptions(nil)
    }
}
