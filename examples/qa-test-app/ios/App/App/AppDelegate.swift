import UIKit
import Capacitor
import AppsFlyerPlugin

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var pendingDeepLinkURL: URL?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        AppsFlyerAttribution.shared.handleLaunchOptions(launchOptions)
        if let urlString = parseLaunchArg(name: "-deepLinkURL"),
           let url = URL(string: urlString) {
            pendingDeepLinkURL = url
            NSLog("[AF_QA][AppDelegate] captured -deepLinkURL launch arg: %@", urlString)
        }
        return true
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        guard let url = pendingDeepLinkURL else { return }
        pendingDeepLinkURL = nil
        // Replay through Capacitor's open-URL pipeline so the AppsFlyer plugin's
        // capacitorOpenURL observer fires the deep-link callback. Avoids the
        // iOS 17/18-simulator "Open in <App>?" prompt that simctl openurl
        // triggers and that nothing in CI can dismiss.
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            _ = ApplicationDelegateProxy.shared.application(application, open: url, options: [:])
            NSLog("[AF_QA][AppDelegate] replayed deep link via openURL: %@", url.absoluteString)
        }
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    private func parseLaunchArg(name: String) -> String? {
        let args = CommandLine.arguments
        guard let idx = args.firstIndex(of: name) else { return nil }
        let next = idx + 1
        guard next < args.count else { return nil }
        return args[next]
    }
}
