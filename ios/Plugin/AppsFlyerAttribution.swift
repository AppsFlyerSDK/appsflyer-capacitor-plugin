//
//  AppsFlyerAttribution.swift
//  Plugin
//
//  Created by Paz Lavi  on 11/07/2021.
//  Copyright © 2021 Max Lynch. All rights reserved.
//

import Foundation
import AppsFlyerLib

/// AppDelegate-facing facade for all three AppsFlyer lifecycle forwards. `handleOpen`/`continueUserActivity` buffer until `AppsFlyerPlugin` flips `bridgeReady`; `handleLaunchOptions` has no such hazard.
/// `bridgeReady`/pending-buffer access is guarded by `lock`: the RPC bridge's completion (sets `bridgeReady`) and Capacitor's open-URL notifications fire on independent threads.
@objc(AppsFlyerAttribution)
public final class AppsFlyerAttribution: NSObject {

    @objc public static let shared = AppsFlyerAttribution()

    private let lock = NSLock()
    private var _bridgeReady = false
    @objc public var bridgeReady: Bool {
        get { lock.withCriticalScope { _bridgeReady } }
        set {
            lock.withCriticalScope { _bridgeReady = newValue }
            if newValue { flushPending() }
        }
    }

    private var pendingUserActivity: NSUserActivity?
    private var pendingUrl: URL?
    private var pendingOptions: [AnyHashable: Any] = [:]

    private override init() {}

    @objc public func continueUserActivity(
        _ userActivity: NSUserActivity,
        restorationHandler: (([Any]?) -> Void)? = nil
    ) {
        let shouldBuffer: Bool = lock.withCriticalScope {
            guard !_bridgeReady else { return false }
            pendingUserActivity = userActivity
            return true
        }
        guard !shouldBuffer else { return }
        AppsFlyerLib.shared().continue(userActivity, restorationHandler: restorationHandler)
    }

    @objc public func handleOpen(_ url: URL, options: [AnyHashable: Any] = [:]) {
        let shouldBuffer: Bool = lock.withCriticalScope {
            guard !_bridgeReady else { return false }
            pendingUrl = url
            pendingOptions = options
            return true
        }
        guard !shouldBuffer else { return }
        AppsFlyerLib.shared().handleOpen(url, options: options)
    }

    @objc public func handleLaunchOptions(_ launchOptions: [AnyHashable: Any]?) {
        AppsFlyerLib.shared().handleLaunchOptions(launchOptions)
    }

    // Drains both buffers so a URL and a userActivity that both arrived before bridgeReady are each delivered exactly once, url+options first per AppsFlyerLib's own precedence.
    private func flushPending() {
        let (url, options, userActivity): (URL?, [AnyHashable: Any], NSUserActivity?) = lock.withCriticalScope {
            defer {
                pendingUrl = nil
                pendingOptions = [:]
                pendingUserActivity = nil
            }
            return (pendingUrl, pendingOptions, pendingUserActivity)
        }
        if let url {
            AppsFlyerLib.shared().handleOpen(url, options: options)
        }
        if let userActivity {
            AppsFlyerLib.shared().continue(userActivity, restorationHandler: nil)
        }
    }
}

private extension NSLock {
    // iOS 15 target — NSLocking.withLock is iOS 16+, so this is a manual equivalent.
    func withCriticalScope<T>(_ body: () -> T) -> T {
        lock()
        defer { unlock() }
        return body()
    }
}
