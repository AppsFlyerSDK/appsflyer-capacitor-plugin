// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "AppsflyerCapacitorPlugin",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "AppsflyerCapacitorPlugin",
            targets: ["AppsFlyerPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/AppsFlyerSDK/AppsFlyerFramework-Static.git", from: "6.17.9"),
    ],
    targets: [
        .target(
            name: "AppsFlyerPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "AppsFlyerLib-Static", package: "AppsFlyerFramework-Static")
            ],
            path: "ios/Plugin",
            // AppsFlyerPlugin.m carries the CAP_PLUGIN + CAP_PLUGIN_METHOD
            // macros that register all 49 plugin methods with Capacitor's
            // bridge. SPM consumers (Capacitor 8's default) MUST compile it,
            // otherwise the bridge can't resolve "AppsFlyerPlugin" at runtime
            // and every JS call fails with "plugin is not implemented on ios".
            // AppsFlyerPlugin.h is a stub framework header (FOUNDATION_EXPORT
            // glue from the original Xcode framework target) that nothing in
            // the SwiftPM target depends on, so we keep it excluded.
            exclude: ["Info.plist", "AppsFlyerPlugin.h"]),
        .testTarget(
            name: "AppsFlyerPluginTests",
            dependencies: ["AppsFlyerPlugin"],
            path: "ios/PluginTests")
    ],
    swiftLanguageVersions: [.v5]
)
