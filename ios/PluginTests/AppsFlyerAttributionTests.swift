import XCTest
@testable import Plugin

final class AppsFlyerAttributionTests: XCTestCase {

    func testHandleOpenBuffersUntilBridgeReady() {
        let attribution = AppsFlyerAttribution.shared
        attribution.bridgeReady = false
        // No AppsFlyerLib call should fire yet — buffered internally.
        attribution.handleOpen(URL(string: "https://example.com")!, options: [:])
        // Flipping bridgeReady should flush without throwing (AppsFlyerLib itself
        // isn't mocked here; this test only proves the buffer/flush wiring compiles
        // and executes without crashing across the property-observer transition).
        attribution.bridgeReady = true
    }

    func testHandleLaunchOptionsForwardsImmediately() {
        // handleLaunchOptions has no buffering hazard (per RN's own doc comment) —
        // it must be callable regardless of bridgeReady state.
        AppsFlyerAttribution.shared.bridgeReady = false
        AppsFlyerAttribution.shared.handleLaunchOptions(nil)
    }
}
