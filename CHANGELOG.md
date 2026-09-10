## 7.0.3
 Release date: *2026-09-10*

- Updated to `@appsflyer-sdk/js-core-plugin@7.1.0` and `af-android-plugin-bridge@7.0.13`.
- Added 3 new Android-only device-ID setters: `setImeiData`, `setOaidData`, `setAndroidIdData` — for apps that already collect the device's IMEI/OAID/Android ID themselves and want to report them to the SDK. See [docs/API.md](docs/API.md#android-only).

## 7.0.2
 Release date: *2026-08-26*

- Migrated to the js-core RPC architecture (`@appsflyer-sdk/js-core-plugin@7.0.15`) — native Android/iOS now only execute RPC calls; all transport and business logic moved to JS.
- **Breaking:** public method names and argument shapes changed to match js-core-plugin's generated API (e.g. `initSDK`/`startSDK` → `init`/`start`; `setCustomerUserId({cuid})` → `setCustomerUserId({customerId})`). See updated example apps for migration guidance.
- **Breaking:** OAOA (`onAppOpenAttribution`) is folded into the unified deep-link (`onDeepLinking`) callback — there is no longer a separate OAOA listener.
- Updated to AppsFlyer SDK v7.0.1 for Android (+ af-android-plugin-bridge 7.0.12) and AppsFlyerRPC v7.0.13 for iOS.
- Bumped `@capacitor/core`/`@capacitor/ios`/`@capacitor/android` to `^8.5.0`, which adds `CAPSceneDelegateProxy` (UIScene-lifecycle support) — no plugin code changes required, since it posts the same `capacitorOpenURL`/`capacitorOpenUniversalLink` notifications this plugin already observes.
- Removed `@capacitor/docgen`/`npm run docgen` — it read JSDoc off the deleted `AppsFlyerPlugin` interface; API docs are no longer generated from this package.

## 6.17.91
 Release date: *2026-04-15*

No release notes available for Capacitor SDK v6.17.91

## 6.17.9
 Release date: *2026-03-25*



## 6.17.8
 Release date: *2025-12-24*



## 6.17.7
 Release date: *2025-10-28*



## 6.17.5
 Release date: *2025-09-04*



## 6.17.5
 Release date: *2025-09-08*

- Updated to AppsFlyer SDK v6.17.3 for Android and and v6.17.5 for iOS
- Unified AFPurchaseDetails data structure for type-safe purchase validation
- Enhanced error handling and consistent API across Android and iOS
- Maintains backward compatibility with existing purchase validation methods

## 6.17.0
 Release date: *2025-05-05*

- Capacitor >> Update AppsFlyer Capacitor Plugin to 6.17.0 and Capacitor to v7

## 6.17.0
- Upgraded AppsFlyer Android SDK to v6.17.0
- Upgraded AppsFlyer iOS SDK to v6.17.0
- Added new Android API `disableAppSetId()` to prevent collection of the Android AppSet ID
- Updated to support Capacitor v7

## 6.16.2
 Release date: *2025-03-26*

- Capacitor >> Update Plugin to v6.16.2

## 6.16.2
 Release date: *2025-03-26*

- Capacitor >> Update Plugin to v6.16.2

## 6.15.2
 Release date: *2024-10-27*

- Capacitor Plugin 6.15.1 build error
- Capacitor Plugin >> Android >> package.json recursive crawl modification

## 6.15.2
 Release date: *2024-10-27*

- Capacitor Plugin 6.15.1 build error
- Capacitor Plugin >> Android >> package.json recursive crawl modification

## 6.15.1
 Release date: *2024-08-28*

- Capacitor >> Update Plugin to v6.15.1

## 6.15.0
 Release date: *2024-08-15*

- Capacitor >> Update Plugin to v6.15.0
- Capacitor >> Update to Capacitor v6

## 6.14.3
 Release date: *2024-05-01*

- Capacitor >> Update Plugin to v6.14.3

## 6.13.1
 Release date: *2024-03-07*

- Capacitor >> Update to iOS SDK v6.13.1

## 6.13.0
 Release date: *2024-02-26*

- Capacitor >> MonoRepo structure project >> failed to build on Android since v6.10.3

## 6.12.1
 Release date: *2023-07-31*

- Capacitor >> Update version to Capacitor v5

## 6.10.3
 Release date: *2023-05-01*

- Capacitor >> create CI for release
- Capacitor >> Update Plugin to v6.10.3

## 6.10.3
 Release date: *2023-05-01*

- Capacitor >> create CI for release
- Capacitor >> Update Plugin to v6.10.3

# Release Notes
### 6.9.2
Release date: *2022-November-13*
- Updated AppsFlyer Android SDK to v6.9.2
- Updated AppsFlyer iOS SDK to v6.9.0
- Update to Capacitor v4
### 6.8.2
Release date: *2022-August-30*
- Updated AppsFlyer Android SDK to v6.8.2
- Updated AppsFlyer iOS SDK to v6.8.1
### 6.8.0
Release date: *2022-July-20*
- Updated AppsFlyer Android SDK to v6.8.0
- Updated AppsFlyer iOS SDK to v6.8.0

**Overview and Highlights:**
- Capacitor >> update SDKs versions 
- Capacitor >> readme >> add AD_ID docs
- Capacitor >> Android >> add `setDisableNetworkData` API
### 6.5.2
Release date: *2022-February-07*
- Updated AppsFlyer Android SDK to v6.5.2
- Updated AppsFlyer iOS SDK to v6.5.2

**Overview and Highlights:**
- Capacitor >> iOS >> `is_deferred` not available  
### 6.4.4
Release date: *2021-December-13*
- Updated AppsFlyer Android SDK to v6.4.3
- Updated AppsFlyer iOS SDK to v6.4.4
### 6.4.0
Release date: *2021-Sep-14* 

**Overview and Highlights:**
- Capacitor >> Update Plugin to v6.4.0 
- Capacitor >> Add APIs
  - added `logCrossPromoteImpression` API
  - added `setUserEmails` API
  - added `logLocation` API  
  - added `setPhoneNumber` API
  - added `setPartnerData` API
  - added `deepLinkTimeout` Parameter
  - added `logInvite` API
  - added `setSharingFilterForPartners` API
- deprecate `setSharingFilterForAllPartners` API
- deprecate `setSharingFilter` API


### 6.3.50
Release date: *2021-Aug-22* 

**Overview and Highlights:**
- Create a new plugin
- Use iOS native SDK  V6.3.5
- Use Android native SDK  V6.3.2
- Support the new API `setCurrentDeviceLanguage` for iOS
