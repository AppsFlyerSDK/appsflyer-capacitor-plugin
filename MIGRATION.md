# Migration Guide: 6.x → 7.0.x

7.0.x replaces the hand-written per-method native bridge with the shared
`@appsflyer-sdk/js-core-plugin` RPC core — native Android/iOS now only execute RPC calls, all
transport and business logic moved to JS. Every method now takes **one params object** — never
positional arguments, even for a single field — and every method returns a `Promise` only, no
`successC`/`errorC` callback arguments. `init()` no longer starts the SDK: starting is a separate,
explicit `start()` call, and it must fire from inside `registerSessionReadyListener`'s callback,
not right after `init()`.

Check `package.json`'s `version` for exactly what you're on — this guide covers the whole 7.0.x
line (currently `7.0.3`, native SDK Android `af-android-sdk` 7.0.1 + `af-android-plugin-bridge`
7.0.13, iOS `AppsFlyerRPC` 7.0.13).

- [Prerequisite](#prerequisite)
- [Checklist](#checklist)
- [`initSDK` → `init` + explicit startup](#initsdk--init--explicit-startup)
- [Full API change reference](#full-api-change-reference)
- [Details on selected changes](#details-on-selected-changes)
  - [Listener API: `addListener(eventName, cb)` → `register*`/`unregister*` pairs](#listener-api-addlistenereventname-cb--registerunregister-pairs)
  - [`validateAndLogInAppPurchase*`: two methods → one, split by platform under `purchase`](#validateandloginapppurchase-two-methods--one-split-by-platform-under-purchase)
  - [`generateInviteLink`: params nest under `parameters`](#generateinvitelink-params-nest-under-parameters)
  - [PII setters split from `setUserEmails`/`setPhoneNumber` into one call per field](#pii-setters-split-from-setuseremailssetphonenumber-into-one-call-per-field)
  - [`setConsentData`/`AppsFlyerConsent` class removed in favor of a plain options object](#setconsentdataappsflyerconsent-class-removed-in-favor-of-a-plain-options-object)
- [Migrating with an LLM coding assistant](#migrating-with-an-llm-coding-assistant)

## Prerequisite

None beyond bumping the package — 7.0.x has no new Capacitor version floor by itself (it needs
`@capacitor/core`/`ios`/`android` `^8.5.0`, already required since 6.17.91). If you're still on
Capacitor 7 or earlier, follow [`docs/Installation.md`](docs/Installation.md) first; this guide
assumes that's already done.

## Checklist

1. Bump to `^7.0.3`, reinstall native deps (`npx cap sync`).
2. Fix every call site listed in the [full API change reference](#full-api-change-reference).
3. Replace `initSDK(options)` with the `init` + `start` flow, including moving any
   deep-link/conversion listener registration to the right place relative to `init()` — see
   [below](#initsdk--init--explicit-startup).
4. If you called `AppsFlyer.addListener('oaoa_callback', cb)`, delete it — OAOA is folded into
   `registerDeepLinkListener`'s `onDeepLinking` callback, there is no replacement listener name.
5. `tsc --noEmit` + tests — signature changes surface as type errors on typed call sites; sweep
   plain JS call sites by hand.
6. Smoke-test on device: install → conversion/deep-link callback → session-ready → `start()` →
   `logEvent()`.

## `initSDK` → `init` + explicit startup

`initSDK(options)` bundled `isDebug`, `waitForATTUserAuthorization`, `manualStart`,
`registerConversionListener`/`registerOnDeepLink`/`registerOnAppOpenAttribution` flags. Replaced
by:

```typescript
import { AppsFlyer } from 'appsflyer-capacitor-plugin';

AppsFlyer.registerDeepLinkListener({ onDeepLinking: cb });   // before init() — see note below
await AppsFlyer.init({ devKey: 'YOUR_DEV_KEY', appId: 'YOUR_APP_ID' }); // was appID, now appId
await AppsFlyer.enableDebug({ enabled: true });               // was isDebug
AppsFlyer.registerConversionListener({                       // was registerConversionListener flag
  onConversionDataSuccess: cb,
  onConversionDataFail: onFail,
});
AppsFlyer.registerSessionReadyListener(() => {                // the one exception — plain callback
  AppsFlyer.start();
});
```

Three rules ([full detail in `docs/API.md`](docs/API.md#session-ready-ordering)):

- `registerDeepLinkListener` goes **before** `init()`, on both platforms — Android drops any
  deep-link result that arrives before a listener is attached, permanently, with no retry.
- `registerConversionListener` registers **synchronously**, right after `init()` — never inside
  `init().then(...)`.
- `start()` only inside `registerSessionReadyListener`'s callback — never a bare call right after
  `init()`. Native never auto-starts.

`waitForATTUserAuthorization` has no replacement — request ATT yourself, from inside the
session-ready callback, before calling `start()` (see
[`docs/AdvancedAPI.md`](docs/AdvancedAPI.md#collect)). `manualStart` has no replacement either —
starting is always manual now, there's no auto-start mode to opt out of.

## Full API change reference

Alphabetical by 6.x name. Rows with no 6.x name are net-new; rows with no 7.x name were removed
outright (deprecated-and-dropped, or dead code that never reached native). Every 7.x call takes
one params object — the column below is the real shape, not a placeholder. Full param tables and
platform support live in [`docs/API.md`'s method reference](docs/API.md#method-reference); this
table is the delta, not a restatement.

| 6.x | 7.x | Change | Notes |
|---|---|---|---|
| `initSDK({devKey, appID, ...})` | `init({devKey, appId})` + `start()` | Removed, replaced | `appID` → `appId`. See [above](#initsdk--init--explicit-startup) |
| `startSDK()` | `start()`, called from `registerSessionReadyListener`'s callback | Renamed + reordered | Never call it right after `init()` |
| `addListener('conversion_callback', cb)` | `registerConversionListener({onConversionDataSuccess, onConversionDataFail})` (+ `unregisterConversionListener`, Android only) | API redesign | See [Listener API](#listener-api-addlistenereventname-cb--registerunregister-pairs) |
| `addListener('oaoa_callback', cb)` | folded into `registerDeepLinkListener({onDeepLinking})` | Merged, no replacement listener | `onAppOpenAttribution`/`onAttributionFailure` no longer exist as a separate event |
| `addListener('udl_callback', cb)` | `registerDeepLinkListener({onDeepLinking})` (+ `unregisterDeepLinkListener`, Android only) | API redesign | See [Listener API](#listener-api-addlistenereventname-cb--registerunregister-pairs) |
| `setCustomerUserId({cuid})` | `setCustomerUserId({customerId})` | Field renamed | |
| `setCurrencyCode({currencyCode})` | `setCurrencyCode({currencyCode})` | Unchanged | |
| `updateServerUninstallToken({token})` | `updateServerUninstallToken({token})` | Unchanged | |
| `setAppInviteOneLink({onelinkID})` | `setAppInviteOneLink({onelinkID})` | Unchanged | |
| `setOneLinkCustomDomain({domains})` | `setOneLinkCustomDomain({domains})` | Unchanged | |
| `appendParametersToDeepLinkingURL({contains, parameters})` | `appendParametersToDeepLinkingURL({contains, parameters})` | Unchanged | Still call before `init()` |
| `setResolveDeepLinkURLs({urls})` | `setResolveDeepLinkURLs({urls})` | Unchanged | |
| `addPushNotificationDeepLinkPath({path})` | `addPushNotificationDeepLinkPath({deepLinkPath})` | Field renamed | `path` → `deepLinkPath` |
| `setSharingFilter({filters})` / `setSharingFilterForAllPartners()` | `setSharingFilterForPartners({partners: [...] })` / `setSharingFilterForPartners({partners: ['all']})` | Merged + renamed | Both deprecated since 6.4.0; one method covers both cases now |
| `setSharingFilterForPartners({filters})` | `setSharingFilterForPartners({partners})` | Field renamed | `filters` → `partners` |
| `setAdditionalData({additionalData})` | `setAdditionalData({customData})` | Field renamed | |
| `getAppsFlyerUID()` | `getAppsFlyerUID()` | Unchanged | |
| `anonymizeUser({anonymizeUser})` | `anonymizeUser({anonymizeUser})` | Unchanged | |
| `stop({stop})` | `stop({shouldStop})` | Field renamed | |
| `disableSKAdNetwork({shouldDisable})` | `setDisableSKAdNetwork({disable})` | Renamed + field renamed | iOS only; call before `init()` |
| `disableAdvertisingIdentifier({shouldDisable})` | `setDisableAdvertisingIdentifiers({disable})` | Renamed + field renamed | |
| `disableCollectASA({shouldDisable})` | `setDisableCollectASA({disable})` | Renamed + field renamed | iOS only |
| `setHost({hostPrefixName, hostName})` | `setHost({hostPrefixName, hostName})` | Unchanged | |
| `generateInviteLink({channel, campaign, referrerName, referrerImageURL, referrerCustomerId, baseDeeplink, brandDomain, addParameters})` | `generateInviteLink({parameters: {...}, awaitResponse?})` | Shape changed | Every field nests under `parameters`; `baseDeeplink` → `baseDeepLink`, `addParameters` → `userParams`. See [notes](#generateinvitelink-params-nest-under-parameters) |
| `validateAndLogInAppPurchaseAndroid(...)` / `validateAndLogInAppPurchaseIos(...)` (deprecated 6.17.7) | `validateAndLogInAppPurchase({purchase, additionalParameters?})` | Two methods → one, shape changed | See [notes](#validateandloginapppurchase-two-methods--one-split-by-platform-under-purchase) |
| `validateAndLogInAppPurchaseV2({purchaseDetails, additionalParameters?})` | `validateAndLogInAppPurchase({purchase, additionalParameters?})` | Renamed | `purchaseDetails` → `purchase`; `purchase.purchaseToken`/`transactionId` are now split per-platform, see notes |
| `getSdkVersion()` | `getSdkVersion()` | Unchanged | |
| `enableFacebookDeferredApplinks({enableFacebookDAL})` | `enableFacebookDeferredApplinks({isEnabled})` | Field renamed | |
| `sendPushNotificationData({pushPayload})` | `sendPushNotificationData({campaign, pid, isRetargeting?, additionalParameters?})` (Android) / `handlePushNotification({pushPayload})` (iOS) | Split by platform, shape changed | See [`docs/API.md`](docs/API.md#sendpushnotificationdata) / [`#handlepushnotification`](docs/API.md#handlepushnotification) |
| `setCurrentDeviceLanguage({language})` | `setCurrentDeviceLanguage({language})` | Unchanged | iOS only (was cross-platform in 6.x with no Android effect) |
| `logCrossPromoteImpression({appID, campaign, parameters})` | `logCrossPromoteImpression({appId, campaign?, userParams?})` | Field renamed | `appID` → `appId`, `parameters` → `userParams` |
| `setUserEmails({emails, encode?})` | — | Removed | Use `setUserEmail({email})` — single address, no crypt-type option. See [notes](#pii-setters-split-from-setuseremailssetphonenumber-into-one-call-per-field) |
| `logLocation({latitude, longitude})` | `logLocation({latitude, longitude})` | Unchanged | |
| `setPhoneNumber({phone})` | `setUserPhone({countryCode, phoneNumber})` | Renamed, split into two fields | See [notes](#pii-setters-split-from-setuseremailssetphonenumber-into-one-call-per-field) |
| — | `setUserFirstName({firstName})` | Net-new | Hashed-PII setter |
| — | `setUserLastName({lastName})` | Net-new | Hashed-PII setter |
| — | `setUserFbLoginId({fbLoginId})` | Net-new | Hashed-PII setter; `fbLoginId` accepts `string \| number` — Facebook login IDs run 15-18 digits, past JS's 53-bit safe-integer range, so pass a string for IDs near that limit |
| — | `clearUserPii()` | Net-new | Clears every PII field set via `setUserEmail`/`setUserPhone`/`setUserFirstName`/`setUserLastName`/`setUserFbLoginId` |
| `setPartnerData({partnerId, data})` | `setPartnerData({partnerId, data})` | Unchanged | |
| `logInvite({channel, eventParameters})` | `logInvite({channel, eventParameters?})` | Unchanged shape | |
| `setDisableNetworkData({disable})` | `setDisableNetworkData({isDisable})` | Field renamed | Android only |
| `enableTCFDataCollection({shouldEnableTCFDataCollection})` | `enableTCFDataCollection({shouldCollect})` | Field renamed | |
| `setConsentData({data})` / `AppsFlyerConsent.forGDPRUser(...)`/`.forNonGDPRUser()` (deprecated 6.16.2) | — | Removed | Use `setConsentDataV2`'s replacement below |
| `setConsentDataV2({isUserSubjectToGDPR, hasConsentForDataUsage?, hasConsentForAdsPersonalization?, hasConsentForAdStorage?})` | `setConsentData({isUserSubjectToGDPR, hasConsentForDataUsage?, hasConsentForAdsPersonalization?, hasConsentForAdStorage?})` | Renamed (V2 → the only version) | Flat params object, no wrapper class. See [notes](#setconsentdataappsflyerconsent-class-removed-in-favor-of-a-plain-options-object) |
| `logAdRevenue({monetizationNetwork, mediationNetwork, currencyIso4217Code, revenue, additionalParameters?})` | `logAdRevenue({...same fields})` | Unchanged | |
| `isSDKStarted()` | `isSessionReady()` | Renamed, semantics narrowed | "session ready" is not identical to "started" — session-ready fires once per launch before you call `start()` |
| `isSDKStopped()` | `isStopped()` | Renamed | |
| `disableAppSetId()` | `disableAppSetId()` | Unchanged | Android only; call before `init()` |
| `logEvent({eventName, eventValue})` | `logEvent({eventName, eventValues?, awaitResponse?})` | Field renamed | `eventValue` → `eventValues` |
| — | `setInstallId({installId})` | Net-new | |
| — | `setDeepLinkTimeout({timeout})` | Net-new | |
| — | `setMinTimeBetweenSessions({seconds})` | Net-new | |
| — | `performDeepLinking({url, shouldTriggerSession?})` | Net-new | Manually triggers deep-link resolution |
| — | `setDisableIDFVCollection({disable})` | Net-new | iOS only |
| — | `setDisableAppleAdsAttribution({disable})` | Net-new | iOS only |
| — | `setUseUninstallSandbox({sandbox})` | Net-new | iOS only |
| — | `setShouldCollectDeviceName({collect})` | Net-new | iOS only |
| — | `setFacebookDeferredAppLink({url})` | Net-new | iOS only |
| — | `handleOpenURL`/`handleOpenUrl`/`continueUserActivity`/`handleLaunchOptions` | Net-new | iOS only, JS-side forwarding for hand-integrated `AppDelegate` — most Capacitor apps don't need these, see [`docs/DeepLink.md`](docs/DeepLink.md) |
| — | `setCollectAndroidID({isCollect})`, `setOutOfStore`/`getOutOfStore`, `getAttributionId`, `getHostName`/`getHostPrefix`, `isPreInstalledApp`, `setLogLevel`, `setIsUpdate`, `setAppId`, `setPreinstallAttribution`, `logSession`, `onPause`, `collectDataFromLauncherActivity` | Net-new | Android only — full list in [`docs/API.md`'s Android-only section](docs/API.md#android-only) |

## Details on selected changes

### Listener API: `addListener(eventName, cb)` → `register*`/`unregister*` pairs

```typescript
// Before
AppsFlyer.addListener('conversion_callback', onConversionResult);
AppsFlyer.addListener('oaoa_callback', onAppOpenAttribution);
AppsFlyer.addListener('udl_callback', onDeepLink);

// After — one callbacks object each, and OAOA has no replacement (folded into onDeepLinking)
AppsFlyer.registerConversionListener({
  onConversionDataSuccess: (data) => { /* ... */ },
  onConversionDataFail: (error) => { /* ... */ },
});
AppsFlyer.registerDeepLinkListener({
  onDeepLinking: (data) => { /* data.status: 'FOUND' | 'NOT_FOUND' | 'ERROR' */ },
});

// full teardown — Android only, both reject on iOS:
AppsFlyer.unregisterConversionListener();
AppsFlyer.unregisterDeepLinkListener();
```

`registerDeepLinkListener` must be registered **before** `init()`; `registerConversionListener`
registers synchronously right after `init()`. See
[Session-ready ordering](docs/API.md#session-ready-ordering).

### `validateAndLogInAppPurchase*`: two methods → one, split by platform under `purchase`

6.x had three separate entry points (`validateAndLogInAppPurchaseAndroid`, `...Ios`, and the
deprecated-but-current `validateAndLogInAppPurchaseV2`) — 7.x has exactly one, with the
platform-specific identifier nested inside `purchase`:

```typescript
// Before (V2, the 6.17.x-current form)
AppsFlyer.validateAndLogInAppPurchaseV2({
  purchaseDetails: { purchaseType, purchaseToken, productId }, // Android
  additionalParameters,
});

// After — iOS
await AppsFlyer.validateAndLogInAppPurchase({
  purchase: { productId, transactionId, purchaseType }, // AFPurchaseDetailsIOS
  additionalParameters,
});
// After — Android
await AppsFlyer.validateAndLogInAppPurchase({
  purchase: { productId, purchaseToken, purchaseType }, // AFPurchaseDetailsAndroid
  additionalParameters,
});
```

`purchaseType` comes from the exported `AFPurchaseType` enum
(`import { AFPurchaseType } from 'appsflyer-capacitor-plugin'`), same as in 6.x. See
[`docs/API.md`](docs/API.md#validateandloginapppurchase) for the full example including
`setUseReceiptValidationSandbox`.

### `generateInviteLink`: params nest under `parameters`

```typescript
// Before
AppsFlyer.generateInviteLink({
  channel: 'gmail',
  campaign: 'myCampaign',
  referrerCustomerId: '1234',
  addParameters: { myParam: 'newUser' },
});

// After
const link = await AppsFlyer.generateInviteLink({
  parameters: {
    channel: 'gmail',
    campaign: 'myCampaign',
    referrerCustomerId: '1234',
    userParams: { myParam: 'newUser' }, // was addParameters
  },
});
```

### PII setters split from `setUserEmails`/`setPhoneNumber` into one call per field

6.x's `setUserEmails` took an array with an optional crypt type; 7.x is single-address, hashed
unconditionally by native, and joined by four new PII setters that didn't exist in 6.x:

```typescript
// Before
AppsFlyer.setUserEmails({ emails: ['user1@gmail.com'], encode: true });
AppsFlyer.setPhoneNumber({ phone: '+15551234567' });

// After
await AppsFlyer.setUserEmail({ email: 'user1@gmail.com' });
await AppsFlyer.setUserPhone({ countryCode: '1', phoneNumber: '5551234567' }); // split, no '+'
await AppsFlyer.setUserFirstName({ firstName: 'Jane' });       // net-new
await AppsFlyer.setUserLastName({ lastName: 'Doe' });          // net-new
await AppsFlyer.setUserFbLoginId({ fbLoginId: '1234567890' }); // net-new
await AppsFlyer.clearUserPii();                                // net-new, clears all five above
```

Multiple emails and the `encode` crypt-type flag have no replacement — pick one address, native
always hashes it.

### `setConsentData`/`AppsFlyerConsent` class removed in favor of a plain options object

The `AppsFlyerConsent` class (`.forGDPRUser(...)`/`.forNonGDPRUser()`) and the original
`setConsentData({data})` it fed are both gone. `setConsentDataV2`'s flat-object shape is what
survived, renamed to `setConsentData`:

```typescript
// Before
import { AppsFlyer, AppsFlyerConsent } from 'appsflyer-capacitor-plugin';
AppsFlyer.setConsentData({
  data: AppsFlyerConsent.forGDPRUser(true, true),
});
// or, already on setConsentDataV2:
AppsFlyer.setConsentDataV2({ isUserSubjectToGDPR: true, hasConsentForDataUsage: true });

// After — one flat object, no wrapper class, method name unchanged from V2's contents
await AppsFlyer.setConsentData({
  isUserSubjectToGDPR: true,
  hasConsentForDataUsage: true,
  hasConsentForAdsPersonalization: true,
  hasConsentForAdStorage: true,
});
```

`isUserSubjectToGDPR` is required — there's no client-side default. See
[`docs/DMA.md`](docs/DMA.md) for DMA-specific consent guidance.

## Migrating with an LLM coding assistant

Point an AI coding assistant (Claude Code, Cursor, Copilot Chat, ...) at your app repo and this
file, then give it:

```text
Migrate this Capacitor app's appsflyer-capacitor-plugin usage from 6.x to 7.0.x. Treat this
repo's MIGRATION.md as the only source of truth for the API diff — read it fully first, don't
rely on prior knowledge of the plugin. If a call site's exact param shape isn't fully spelled out
in MIGRATION.md, cross-check it against docs/API.md's "Method reference" section (the generated,
authoritative param tables) before guessing.

1. Open the "Full API change reference" table. For every 6.x symbol used anywhere in this repo,
   apply the exact 7.x replacement and Change-column behavior from that row. Treat rows with no
   7.x name as "delete this call site, no replacement exists" and rows with no 6.x name as "new
   API, not required to adopt".
2. For initSDK(...) call sites: replace with init()+start() per the "initSDK -> init" section,
   keeping the three ordering rules — registerDeepLinkListener called BEFORE init() on both
   platforms; registerConversionListener registered synchronously right after init(), never
   inside init().then(...); start() only inside registerSessionReadyListener's callback, never a
   bare call right after init().
3. If addListener('oaoa_callback', cb) is used anywhere, delete it outright — there is no
   replacement listener name, its behavior is now folded into registerDeepLinkListener's
   onDeepLinking callback. Read docs/DeepLink.md before touching deep-link call sites so the
   merged callback's data.status contract ('FOUND' | 'NOT_FOUND' | 'ERROR') is handled correctly.
4. Every method now takes exactly one params object — never positional arguments. Any
   successC/errorC/callback argument left over from a 6.x call is now simply unused, not
   invoked — replace with await/.then() on the returned Promise.
5. For rows under "Details on selected changes" (validateAndLogInAppPurchase*, generateInviteLink,
   PII setters, setConsentData), read that subsection before editing the call site — the table
   row alone doesn't carry the full shape change, and each of these was a shape change, not a
   rename.
6. If timeToWaitForATTUserAuthorization/waitForATTUserAuthorization was used, add an explicit ATT
   request yourself from inside registerSessionReadyListener's callback, before start() — read
   docs/AdvancedAPI.md's "Collect IDFA with ATTrackingManager" section for the native-permission
   call this replaces.
7. If validateAndLogInAppPurchase is used, read docs/API.md#validateandloginapppurchase in full —
   the purchase object shape differs by platform (transactionId on iOS, purchaseToken on
   Android), and there's a Capacitor.getPlatform() branch needed at the call site.
8. Run tsc --noEmit and tests; fix type errors from signature changes.
9. Report every change made, file by file, and flag anything found that the table above doesn't
   cover instead of guessing at it.
```
