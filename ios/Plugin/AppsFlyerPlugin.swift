import Foundation
import UIKit
import Capacitor
import AppsFlyerRPC

@objc(AppsFlyerPlugin)
public class AppsFlyerPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AppsFlyerPlugin"
    public let jsName = "AppsFlyerPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "executeRpc", returnType: CAPPluginReturnPromise),
    ]

    public override func load() {
        AppsFlyerRPCBridge.shared.setEventHandler { [weak self] jsonEvent in
            self?.notifyListeners("rpcEvent", data: ["envelopeJson": jsonEvent])
        }
        NotificationCenter.default
            .addObserver(
                self,
                selector: #selector(self.handleUrlOpened(notification:)),
                name: Notification.Name.capacitorOpenURL,
                object: nil
            )
        NotificationCenter.default
            .addObserver(
                self,
                selector: #selector(self.handleUniversalLink(notification:)),
                name: Notification.Name.capacitorOpenUniversalLink,
                object: nil
            )
    }

    // Capacitor-idiomatic deep-link/UDL glue — no RN equivalent to port, since RN's
    // architecture has consuming apps forward these manually via AppDelegate instead.
    @objc func handleUrlOpened(notification: NSNotification) {
        guard let object = notification.object as? [String: Any?] else {
            return
        }
        guard let url = object["url"] else {
            return
        }
        guard let options = object["options"] else {
            return
        }
        AppsFlyerAttribution.shared.handleOpen(
            url as! URL,
            options: options as! [UIApplication.OpenURLOptionsKey: Any]
        )
    }

    @objc func handleUniversalLink(notification: NSNotification) {
        guard let object = notification.object as? [String: Any?] else {
            return
        }
        let user = NSUserActivity(activityType: NSUserActivityTypeBrowsingWeb)
        guard let url = object["url"] else {
            return
        }
        user.webpageURL = (url as! URL)
        AppsFlyerAttribution.shared.continueUserActivity(user)
    }

    @objc func executeRpc(_ call: CAPPluginCall) {
        guard let requestJson = call.getString("requestJson") else {
            call.reject("requestJson is required")
            return
        }
        let requestedMethod = Self.canonicalMethod(ofRequestJson: requestJson)
        AppsFlyerRPCBridge.shared.executeJson(requestJson) { responseJson in
            let (normalized, succeeded) = Self.normalize(iosResponseJson: responseJson)
            if requestedMethod == "initialize" && succeeded {
                // Setting bridgeReady triggers AppsFlyerAttribution's own didSet flush — no notification needed.
                AppsFlyerAttribution.shared.bridgeReady = true
            }
            call.resolve(["responseJson": normalized])
        }
    }

    // internal (not private) + static so AppsFlyerPluginTests can call these directly.
    static func canonicalMethod(ofRequestJson requestJson: String) -> String? {
        guard
            let data = requestJson.data(using: .utf8),
            let request = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else {
            return nil
        }
        return request["method"] as? String
    }

    /// Normalizes iOS's AFRPCResponse into the shared { success, data|error } shape.
    static func normalize(iosResponseJson responseJson: String) -> (json: String, succeeded: Bool) {
        guard
            let data = responseJson.data(using: .utf8),
            let response = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else {
            return (encodeNormalizedError(code: 500, message: "Malformed AFRPCResponse from native RPC layer"), false)
        }

        if let error = response["error"] as? [String: Any] {
            let code = error["code"] as? Int ?? 500
            let message = error["message"] as? String ?? "Unknown protocol error"
            return (encodeNormalizedError(code: code, message: message), false)
        }

        guard let result = response["result"] as? [String: Any] else {
            return (encodeNormalizedError(code: 500, message: "Missing result in AFRPCResponse"), false)
        }

        if result["success"] as? Bool == false {
            let message = (result["error"] as? String) ?? (result["message"] as? String) ?? "SDK-level failure"
            return (encodeNormalizedError(code: 500, message: message), false)
        }

        return (encodeJSONOrFallback(["success": true, "data": result["data"] ?? NSNull()]), true)
    }

    private static func encodeNormalizedError(code: Int, message: String) -> String {
        encodeJSONOrFallback(["success": false, "error": ["code": code, "message": message]])
    }

    private static func encodeJSONOrFallback(_ object: [String: Any]) -> String {
        guard
            let data = try? JSONSerialization.data(withJSONObject: object),
            let json = String(data: data, encoding: .utf8)
        else {
            return "{\"success\":false,\"error\":{\"code\":500,\"message\":\"Failed to encode RPC response\"}}"
        }
        return json
    }
}
