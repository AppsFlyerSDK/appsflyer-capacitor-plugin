import XCTest
@testable import Plugin

class AppsFlyerPluginTests: XCTestCase {
    override func setUp() {
        super.setUp()
    }

    override func tearDown() {
        super.tearDown()
    }

    func testEcho() {
        let implementation = AppsFlyerPlugin()
        let value = "Hello, World!"
        let result = implementation.echo(value)

        XCTAssertEqual(value, result)
    }

    // MARK: - handleUrlOpened safe cast tests

    func testHandleUrlOpened_nilObject_doesNotCrash() {
        let plugin = AppsFlyerPlugin()
        let notification = NSNotification(name: .capacitorOpenURL, object: nil)

        // Should return early without crashing
        plugin.handleUrlOpened(notification: notification)
    }

    func testHandleUrlOpened_wrongObjectType_doesNotCrash() {
        let plugin = AppsFlyerPlugin()
        let notification = NSNotification(name: .capacitorOpenURL, object: "not a dictionary")

        plugin.handleUrlOpened(notification: notification)
    }

    func testHandleUrlOpened_missingUrlKey_doesNotCrash() {
        let plugin = AppsFlyerPlugin()
        let object: [String: Any?] = ["options": [:] as [UIApplication.OpenURLOptionsKey: Any]]
        let notification = NSNotification(name: .capacitorOpenURL, object: object)

        plugin.handleUrlOpened(notification: notification)
    }

    func testHandleUrlOpened_urlIsWrongType_doesNotCrash() {
        let plugin = AppsFlyerPlugin()
        let object: [String: Any?] = [
            "url": "not-a-url-object" as Any,
            "options": [:] as [UIApplication.OpenURLOptionsKey: Any]
        ]
        let notification = NSNotification(name: .capacitorOpenURL, object: object)

        plugin.handleUrlOpened(notification: notification)
    }

    func testHandleUrlOpened_urlIsNilValue_doesNotCrash() {
        let plugin = AppsFlyerPlugin()
        let object: [String: Any?] = [
            "url": nil,
            "options": [:] as [UIApplication.OpenURLOptionsKey: Any]
        ]
        let notification = NSNotification(name: .capacitorOpenURL, object: object)

        plugin.handleUrlOpened(notification: notification)
    }

    func testHandleUrlOpened_missingOptionsKey_doesNotCrash() {
        let plugin = AppsFlyerPlugin()
        let object: [String: Any?] = [
            "url": URL(string: "https://example.com")! as Any
        ]
        let notification = NSNotification(name: .capacitorOpenURL, object: object)

        plugin.handleUrlOpened(notification: notification)
    }

    func testHandleUrlOpened_optionsIsWrongType_doesNotCrash() {
        let plugin = AppsFlyerPlugin()
        let object: [String: Any?] = [
            "url": URL(string: "https://example.com")! as Any,
            "options": "not-a-dictionary" as Any
        ]
        let notification = NSNotification(name: .capacitorOpenURL, object: object)

        plugin.handleUrlOpened(notification: notification)
    }

    func testHandleUrlOpened_validInputs_doesNotCrash() {
        let plugin = AppsFlyerPlugin()
        let object: [String: Any?] = [
            "url": URL(string: "https://example.com")! as Any,
            "options": [:] as [UIApplication.OpenURLOptionsKey: Any]
        ]
        let notification = NSNotification(name: .capacitorOpenURL, object: object)

        // Should proceed through to AppsFlyerAttribution without crashing
        plugin.handleUrlOpened(notification: notification)
    }

    // MARK: - handleUniversalLink safe cast tests

    func testHandleUniversalLink_nilObject_doesNotCrash() {
        let plugin = AppsFlyerPlugin()
        let notification = NSNotification(name: .capacitorOpenUniversalLink, object: nil)

        plugin.handleUniversalLink(notification: notification)
    }

    func testHandleUniversalLink_wrongObjectType_doesNotCrash() {
        let plugin = AppsFlyerPlugin()
        let notification = NSNotification(name: .capacitorOpenUniversalLink, object: 42)

        plugin.handleUniversalLink(notification: notification)
    }

    func testHandleUniversalLink_missingUrlKey_doesNotCrash() {
        let plugin = AppsFlyerPlugin()
        let object: [String: Any?] = ["other": "value"]
        let notification = NSNotification(name: .capacitorOpenUniversalLink, object: object)

        plugin.handleUniversalLink(notification: notification)
    }

    func testHandleUniversalLink_urlIsWrongType_doesNotCrash() {
        let plugin = AppsFlyerPlugin()
        let object: [String: Any?] = ["url": 12345 as Any]
        let notification = NSNotification(name: .capacitorOpenUniversalLink, object: object)

        plugin.handleUniversalLink(notification: notification)
    }

    func testHandleUniversalLink_urlIsNilValue_doesNotCrash() {
        let plugin = AppsFlyerPlugin()
        let object: [String: Any?] = ["url": nil]
        let notification = NSNotification(name: .capacitorOpenUniversalLink, object: object)

        plugin.handleUniversalLink(notification: notification)
    }

    func testHandleUniversalLink_validUrl_doesNotCrash() {
        let plugin = AppsFlyerPlugin()
        let object: [String: Any?] = [
            "url": URL(string: "https://example.com/path")! as Any
        ]
        let notification = NSNotification(name: .capacitorOpenUniversalLink, object: object)

        // Should proceed through to AppsFlyerAttribution without crashing
        plugin.handleUniversalLink(notification: notification)
    }

    func testHandleUrlOpened_emptyDictionary_doesNotCrash() {
        let plugin = AppsFlyerPlugin()
        let object: [String: Any?] = [:]
        let notification = NSNotification(name: .capacitorOpenURL, object: object)

        plugin.handleUrlOpened(notification: notification)
    }

    func testHandleUniversalLink_emptyDictionary_doesNotCrash() {
        let plugin = AppsFlyerPlugin()
        let object: [String: Any?] = [:]
        let notification = NSNotification(name: .capacitorOpenUniversalLink, object: object)

        plugin.handleUniversalLink(notification: notification)
    }
}
