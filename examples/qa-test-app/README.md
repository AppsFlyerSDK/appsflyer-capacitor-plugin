# AppsFlyer QA Test App (Capacitor)

Minimal Capacitor app that satisfies the AppsFlyer plugin **test app contract** so the [`af-scenario-runner.sh`](../../scripts/af-scenario-runner.sh) can drive E2E and post-publish smoke runs identically across plugins.

This app exists to be **driven by automation**, not used by humans. It auto-runs the full SDK contract on launch.

## What it does on cold launch

1. Reads `DEV_KEY` and `APP_ID` from `.env` (Vite injects them at build time).
2. Registers all three SDK callbacks (`conversion_callback`, `oaoa_callback`, `udl_callback`).
3. Calls `initSDK({ manualStart: true })` and logs the result.
4. Calls pre-start APIs (`setCustomerUserId`, `setCurrencyCode`, `setAdditionalData`, `setHost`) with QA-canonical values.
5. Logs `[AF_QA][AUTO_APIS] --- Pre-start auto APIs complete ---`.
6. Calls `startSDK()` and logs `[AF_QA][startSDK] result: SUCCESS` or `... error: <msg>`.
7. Calls post-start APIs (`getSdkVersion`, `getAppsFlyerUID`).
8. Logs `[AF_QA][AUTO_APIS] --- Post-start auto APIs complete ---`.
9. Fires the three standard events (`af_demo_launch`, `af_purchase`, `af_content_view`).
10. Fires a custom event (`af_qa_custom_purchase`) with multi-type parameters and a nested `metadata` map.
11. Runs the consent toggle cycle: `stop(true)` → suppressed event → `stop(false)` → resumed event.

Every line is tagged `[AF_QA]` so `grep AF_QA` is enough to validate scenarios.

## Identity

| Surface | Value |
|---|---|
| Bundle / package id | `com.appsflyer.qa.capacitor` |
| URL scheme | `afqa-capacitor://` |
| Plugin slug | `capacitor` |

## Build

```bash
cp .env.example .env  # Fill in DEV_KEY and APP_ID
npm install
npm run build
npx cap sync
```

### Android

```bash
cd android
./gradlew assembleDebug
```

APK: `android/app/build/outputs/apk/debug/app-debug.apk`

### iOS

```bash
cd ios/App
xcodebuild -project App.xcodeproj -scheme App \
  -configuration Debug -sdk iphonesimulator \
  -derivedDataPath build CODE_SIGNING_ALLOWED=NO build
```

App: `ios/App/build/Build/Products/Debug-iphonesimulator/App.app`

## Logs

| Platform | Where |
|---|---|
| Android | `adb logcat | grep AF_QA` |
| iOS (stdout) | Xcode console / `xcrun simctl spawn <UDID> log stream` |
| iOS (file) | `<sandbox>/Documents/af_qa_logs.txt` (written by the in-app `AfQaLogger` plugin) |

## Deep link replay (iOS)

`xcrun simctl openurl` triggers iOS 17/18's "Open in <App>?" prompt that nothing in CI can dismiss. This app's `AppDelegate.swift` instead reads a `-deepLinkURL <url>` launch argument and posts it to Capacitor's open-URL notification — same plugin pipeline as a real custom-scheme open, no prompt.

```sh
xcrun simctl launch <UDID> com.appsflyer.qa.capacitor -deepLinkURL "afqa-capacitor://deeplink?deep_link_value=qa_deeplink_bg"
```

## Run via the scenario runner

From the repo root:

```bash
./scripts/af-scenario-runner.sh --platform android --plan .af-e2e/test-plan.json --build
./scripts/af-scenario-runner.sh --platform ios --plan .af-e2e/test-plan.json --build
```
