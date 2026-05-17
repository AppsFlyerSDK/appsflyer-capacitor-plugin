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
            // The plugin uses the modern Capacitor 6+ CAPBridgedPlugin
            // protocol for registration (see AppsFlyerPlugin.swift), so
            // there is no .m file to compile. SwiftPM doesn't allow mixed
            // Swift + Objective-C source in a single target anyway, so
            // adding one back would break SPM consumers (Capacitor 8's
            // default). Info.plist stays excluded; it's resource metadata,
            // not source.
            exclude: ["Info.plist"]),
        .testTarget(
            name: "AppsFlyerPluginTests",
            dependencies: ["AppsFlyerPlugin"],
            path: "ios/PluginTests")
    ],
    swiftLanguageVersions: [.v5]
)
