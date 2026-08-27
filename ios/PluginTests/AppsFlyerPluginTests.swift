import XCTest
@testable import Plugin

final class AppsFlyerPluginTests: XCTestCase {

    func testNormalizeReturnsSuccessEnvelope() {
        let iosResponse = #"{"result":{"success":true,"data":{"uid":"abc"}}}"#
        let (json, succeeded) = AppsFlyerPlugin.normalize(iosResponseJson: iosResponse)
        XCTAssertTrue(succeeded)
        XCTAssertTrue(json.contains("\"success\":true"))
        XCTAssertTrue(json.contains("\"uid\":\"abc\""))
    }

    func testNormalizeReturnsErrorEnvelopeOnProtocolError() {
        let iosResponse = #"{"error":{"code":404,"message":"not found"}}"#
        let (json, succeeded) = AppsFlyerPlugin.normalize(iosResponseJson: iosResponse)
        XCTAssertFalse(succeeded)
        XCTAssertTrue(json.contains("\"code\":404"))
    }

    func testNormalizeReturnsErrorEnvelopeOnMalformedJson() {
        let (json, succeeded) = AppsFlyerPlugin.normalize(iosResponseJson: "not json")
        XCTAssertFalse(succeeded)
        XCTAssertTrue(json.contains("Malformed AFRPCResponse"))
    }

    func testCanonicalMethodExtractsMethodName() {
        let requestJson = #"{"method":"initialize","params":{}}"#
        XCTAssertEqual(AppsFlyerPlugin.canonicalMethod(ofRequestJson: requestJson), "initialize")
    }
}
