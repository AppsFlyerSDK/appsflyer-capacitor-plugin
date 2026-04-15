---
name: verify-plugin-release
description: >-
  Verify an AppsFlyer Capacitor plugin release (RC or production) by installing
  from npm, building and running the example app on Android and iOS, and
  validating SDK behavior from device logs. Use when the user asks to test a
  release, verify an RC, run the example app after publishing, or check that a
  published plugin version works on both platforms.
---

# Verify plugin release

End-to-end verification of a published AppsFlyer Capacitor plugin version using
the example app at `examples/CapacitorReact`.

## Prerequisites

Before starting, confirm:
- An Android physical device is connected (`adb devices`)
- An iOS simulator is booted (`xcrun simctl list devices booted`)
- The target version is published on npm (`npm view appsflyer-capacitor-plugin@<tag> version`)
- The example app has a valid `.env` with `REACT_APP_AF_DEV_KEY` and `REACT_APP_AF_APP_ID`

## Workflow

### 1. Determine the install tag

| Release type | npm tag | Install script |
|---|---|---|
| RC / QA | `QA` | `npm run installQA` |
| Production | `latest` | `npm run installFromNpm` |

Confirm the published version:

```bash
npm view appsflyer-capacitor-plugin@QA version   # for RC
npm view appsflyer-capacitor-plugin@latest version  # for production
```

### 2. Install the plugin from npm

From `examples/CapacitorReact`:

```bash
npm run installQA        # RC releases
# or
npm run installFromNpm   # production releases
```

This runs `npm install appsflyer-capacitor-plugin@<tag> && npx cap sync`.

### 3. Handle iOS pod install failures

If `cap sync` fails on iOS with a pod version conflict (common when the native
SDK version was bumped), fix it:

```bash
cd ios/App
rm Podfile.lock
pod repo update
pod install
cd ../..
```

Then re-run `npx cap sync` to confirm both platforms succeed.

### 4. Build web assets and sync

```bash
npm run rebuild
```

This runs `npm run build && npx cap sync`. Verify the Capacitor sync output
lists the correct plugin version for both platforms:

```
appsflyer-capacitor-plugin@<expected-version>
```

### 5. Deploy to devices

Identify targets:
- Android: `adb devices` (use the physical device serial)
- iOS: `xcrun simctl list devices booted` (use the simulator UDID)

Run in parallel:

```bash
npx cap run android --target <DEVICE_SERIAL>
npx cap run ios --target <SIMULATOR_UDID>
```

Both should complete with `Deploying ... to <target>`.

### 6. Collect and verify logs

Give the user a moment to interact with the app, then pull logs.

**Android:**

```bash
adb -s <DEVICE_SERIAL> logcat -d -v time \
  | grep -iE "AppsFlyer_[0-9]|Capacitor/Plugin|CapacitorPlugin|onConversion|logEvent" \
  | tail -60
```

**iOS:**

```bash
xcrun simctl spawn <SIMULATOR_UDID> log show --last 2m \
  --predicate 'eventMessage CONTAINS "AppsFlyer" OR eventMessage CONTAINS "initSdk" OR eventMessage CONTAINS "onConversion" OR eventMessage CONTAINS "logEvent" OR (process == "App" AND eventMessage CONTAINS[cd] "capacitor")' \
  --style compact
```

### 7. Verification checklist

Confirm the following from the logs:

- [ ] **SDK version**: Native SDK version matches `androidSdkVersion` / `iosSdkVersion` from `package.json`
- [ ] **Plugin version**: `platform_extension_v2.version` matches the published version
- [ ] **Launch event**: Sent successfully with HTTP 200 response
- [ ] **Conversion data**: `onConversionDataSuccess` callback received
- [ ] **In-app event** (if triggered): `logEvent` sent with HTTP 200 response
- [ ] **No crashes or errors**: No fatal/error-level AppsFlyer logs

### 8. Clean up

After verification, revert the example app's `package.json` back to local dependency:

```bash
cd examples/CapacitorReact
npm run installLocal
```

This restores the `"appsflyer-capacitor-plugin": "file:../.."` dependency so the
repo stays clean for development.

## Troubleshooting

| Problem | Solution |
|---|---|
| `CocoaPods could not find compatible versions` | Delete `Podfile.lock`, run `pod repo update`, then `pod install` |
| Android logcat shows no AppsFlyer logs | Widen the grep filter; some SDK versions use different tag prefixes |
| iOS logs are sparse / redacted | The unified log system redacts messages in simulator builds; check for TLS connections to `*.appsflyersdk.com` as evidence of SDK communication |
| `.env` not found or no dev key | Create `examples/CapacitorReact/.env` with `REACT_APP_AF_DEV_KEY` and `REACT_APP_AF_APP_ID` |
| `npm publish` conflict on re-run | Use "Re-run failed jobs" in GitHub Actions instead of re-running the entire workflow |
