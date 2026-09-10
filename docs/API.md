# API

<img src="https://massets.appsflyer.com/wp-content/uploads/2018/06/20092440/static-ziv_1TP.png" width="400">

Every method below is kept in sync with `@appsflyer-sdk/js-core-plugin`'s public `AppsFlyerSDK`
class (`node_modules/@appsflyer-sdk/js-core-plugin/dist/appsflyer-sdk.d.ts`) and its RPC dispatch
table (`dist/generated/rpc-map.js`) — that's the source of truth for this page, and your editor's
autocomplete on the `AppsFlyer` import will always match it exactly. If this page and your editor
ever disagree, trust the editor and file an issue.

- [Basic usage](#basic-usage)
- [Session-ready ordering](#session-ready-ordering)
- [Listeners](#listeners)
- [Supported methods](#supported-methods)
- [Method reference](#method-reference)
- [Migrating from 6.x](#migrating-from-6x)

## Basic usage

```typescript
import { AppsFlyer } from 'appsflyer-capacitor-plugin';

await AppsFlyer.init({ devKey: 'YOUR_DEV_KEY', appId: 'YOUR_APP_ID' });
await AppsFlyer.enableDebug({ enabled: true });

AppsFlyer.registerSessionReadyListener(() => {
  // start() must be called from inside this callback — see "Session-ready ordering" below.
  AppsFlyer.start();
});
```

## Session-ready ordering

SDK 7 uses a manual-start model: `start()` records the session and must not be called until the
SDK reports it's ready. Always call methods in this order:

1. `init(params)`
2. `registerSessionReadyListener(onReady)`
3. Call `start()` **from inside** `onReady`

Calling `start()` before `onReady` fires won't throw, but it also won't do what you want — the
call goes to native immediately, without whatever init-time setup a real "ready" state implies.

## Listeners

Callback-based listeners replace the old `addListener(eventName, cb)` pattern. Registration
order matters and differs per listener:

- `registerDeepLinkListener` — call **before** `init()`, on both platforms. Android drops any
  deep-link result that arrives before a listener is attached, permanently, with no retry.
- `registerConversionListener` — call synchronously right **after** `init()`, not inside
  `init().then(...)`.

```typescript
AppsFlyer.registerDeepLinkListener({
  onDeepLinking: (data) => { /* data.status: 'FOUND' | 'NOT_FOUND' | 'ERROR' */ },
});

await AppsFlyer.init({ devKey: 'YOUR_DEV_KEY', appId: 'YOUR_APP_ID' });

AppsFlyer.registerConversionListener({
  onConversionDataSuccess: (data) => { /* ... */ },
  onConversionDataFail: (error) => { /* ... */ },
});
```

**Breaking change:** there is no separate OAOA (`onAppOpenAttribution`) listener anymore — SDK 7
folds app-open attribution into the same `onDeepLinking` callback above.

## Supported methods

A platform value of "—" means the underlying native SDK has no equivalent call, so
`AppsFlyer.<method>()` rejects on that platform.

| Method | Android | iOS |
| --- | --- | --- |
| [`addPushNotificationDeepLinkPath`](#addpushnotificationdeeplinkpath) | ✅ | ✅ |
| [`anonymizeUser`](#anonymizeuser) | ✅ | ✅ |
| [`appendParametersToDeepLinkingURL`](#appendparameterstodeeplinkingurl) | ✅ | ✅ |
| [`clearUserPii`](#clearuserpii) | ✅ | ✅ |
| [`collectDataFromLauncherActivity`](#collectdatafromlauncheractivity) | ✅ | — |
| [`continueUserActivity`](#continueuseractivity) | — | ✅ |
| [`disableAppSetId`](#disableappsetid) | ✅ | — |
| [`enableDebug`](#enabledebug) | ✅ | ✅ |
| [`enableFacebookDeferredApplinks`](#enablefacebookdeferredapplinks) | ✅ | ✅ |
| [`enableTCFDataCollection`](#enabletcfdatacollection) | ✅ | ✅ |
| [`generateInviteLink`](#generateinvitelink) | ✅ | ✅ |
| [`getAppsFlyerUID`](#getappsflyeruid) | ✅ | ✅ |
| [`getAttributionId`](#getattributionid) | ✅ | — |
| [`getHostName`](#gethostname) | ✅ | ✅ |
| [`getHostPrefix`](#gethostprefix) | ✅ | ✅ |
| [`getOutOfStore`](#getoutofstore) | ✅ | — |
| [`getSdkVersion`](#getsdkversion) | ✅ | ✅ |
| [`handleLaunchOptions`](#handlelaunchoptions) | — | ✅ |
| [`handleOpenUrl`](#handleopenurl) | — | ✅ |
| [`handleOpenURL`](#handleopenurl-1) | — | ✅ |
| [`handlePushNotification`](#handlepushnotification) | — | ✅ |
| [`init`](#init) | ✅ | ✅ |
| [`isPreInstalledApp`](#ispreinstalledapp) | ✅ | — |
| [`isSessionReady`](#issessionready) | ✅ | ✅ |
| [`isStopped`](#isstopped) | ✅ | ✅ |
| [`logAdRevenue`](#logadrevenue) | ✅ | ✅ |
| [`logAndOpenStore`](#logandopenstore) | ✅ | ✅ |
| [`logCrossPromoteImpression`](#logcrosspromoteimpression) | ✅ | ✅ |
| [`logEvent`](#logevent) | ✅ | ✅ |
| [`logInvite`](#loginvite) | ✅ | ✅ |
| [`logLocation`](#loglocation) | ✅ | ✅ |
| [`logSession`](#logsession) | ✅ | — |
| [`onPause`](#onpause) | ✅ | — |
| [`performDeepLinking`](#performdeeplinking) | ✅ | ✅ |
| [`registerConversionListener`](#registerconversionlistener) | ✅ | ✅ |
| [`registerDeepLinkListener`](#registerdeeplinklistener) | ✅ | ✅ |
| [`registerSessionReadyListener`](#registersessionreadylistener) | ✅ | ✅ |
| [`sendPushNotificationData`](#sendpushnotificationdata) | ✅ | — |
| [`setAdditionalData`](#setadditionaldata) | ✅ | ✅ |
| [`setAndroidIdData`](#setandroididdata) | ✅ | — |
| [`setAppId`](#setappid) | ✅ | — |
| [`setAppInviteOneLink`](#setappinviteonelink) | ✅ | ✅ |
| [`setCollectAndroidID`](#setcollectandroidid) | ✅ | — |
| [`setConsentData`](#setconsentdata) | ✅ | ✅ |
| [`setCurrencyCode`](#setcurrencycode) | ✅ | ✅ |
| [`setCurrentDeviceLanguage`](#setcurrentdevicelanguage) | — | ✅ |
| [`setCustomerUserId`](#setcustomeruserid) | ✅ | ✅ |
| [`setDeepLinkTimeout`](#setdeeplinktimeout) | ✅ | ✅ |
| [`setDisableAdvertisingIdentifiers`](#setdisableadvertisingidentifiers) | ✅ | ✅ |
| [`setDisableAppleAdsAttribution`](#setdisableappleadsattribution) | — | ✅ |
| [`setDisableCollectASA`](#setdisablecollectasa) | — | ✅ |
| [`setDisableIDFVCollection`](#setdisableidfvcollection) | — | ✅ |
| [`setDisableNetworkData`](#setdisablenetworkdata) | ✅ | — |
| [`setDisableSKAdNetwork`](#setdisableskadnetwork) | — | ✅ |
| [`setFacebookDeferredAppLink`](#setfacebookdeferredapplink) | — | ✅ |
| [`setHost`](#sethost) | ✅ | ✅ |
| [`setImeiData`](#setimeidata) | ✅ | — |
| [`setInstallId`](#setinstallid) | ✅ | ✅ |
| [`setIsUpdate`](#setisupdate) | ✅ | — |
| [`setLogLevel`](#setloglevel) | ✅ | — |
| [`setMinTimeBetweenSessions`](#setmintimebetweensessions) | ✅ | ✅ |
| [`setOaidData`](#setoaiddata) | ✅ | — |
| [`setOneLinkCustomDomain`](#setonelinkcustomdomain) | ✅ | ✅ |
| [`setOutOfStore`](#setoutofstore) | ✅ | — |
| [`setPartnerData`](#setpartnerdata) | ✅ | ✅ |
| [`setPluginInfo`](#setplugininfo-internal) | ✅ | ✅ |
| [`setPreinstallAttribution`](#setpreinstallattribution) | ✅ | — |
| [`setResolveDeepLinkURLs`](#setresolvedeeplinkurls) | ✅ | ✅ |
| [`setSharingFilterForPartners`](#setsharingfilterforpartners) | ✅ | ✅ |
| [`setShouldCollectDeviceName`](#setshouldcollectdevicename) | — | ✅ |
| [`setUseReceiptValidationSandbox`](#setusereceiptvalidationsandbox) | — | ✅ |
| [`setUserEmail`](#setuseremail) | ✅ | ✅ |
| [`setUserFbLoginId`](#setuserfbloginid) | ✅ | ✅ |
| [`setUserFirstName`](#setuserfirstname) | ✅ | ✅ |
| [`setUserLastName`](#setuserlastname) | ✅ | ✅ |
| [`setUserPhone`](#setuserphone) | ✅ | ✅ |
| [`setUseUninstallSandbox`](#setuseuninstallsandbox) | — | ✅ |
| [`start`](#start) | ✅ | ✅ |
| [`stop`](#stop) | ✅ | ✅ |
| [`unregisterConversionListener`](#unregisterconversionlistener) | ✅ | — |
| [`unregisterDeepLinkListener`](#unregisterdeeplinklistener) | ✅ | — |
| [`unregisterSessionReadyListener`](#unregistersessionreadylistener) | ✅ | ✅ |
| [`updateServerUninstallToken`](#updateserveruninstalltoken) | ✅ | ✅ |
| [`validateAndLogInAppPurchase`](#validateandloginapppurchase) | ✅ | ✅ |

## Method reference

Each entry lists the call signature, a short description, its parameters (from
`dist/generated/methods.d.ts`), and a usage example. `Capacitor.getPlatform()` (from
`@capacitor/core`) is only shown where a method is platform-specific.

### init

`init(params) : Promise<void>`

Initializes the SDK with your dev key. Must be called before any other method except
`registerDeepLinkListener` — see [Session-ready ordering](#session-ready-ordering).

| parameter | type | description |
| --- | --- | --- |
| devKey | string | your AppsFlyer dev key |
| appId | string \| null | Apple App ID (numeric). Required on iOS, ignored on Android — pass it unconditionally. Optional |

```typescript
await AppsFlyer.init({ devKey: 'K2***********99', appId: '41*****44' });
```

### start

`start(params?) : Promise<void>`

Records the install/session. The native SDK never auto-starts — call this from inside
`registerSessionReadyListener`'s callback, after any consent/ATT status you need to collect. See
[Session-ready ordering](#session-ready-ordering).

| parameter | type | description |
| --- | --- | --- |
| awaitResponse | boolean | optional; wait for the native SDK's own completion handler instead of resolving as soon as the call is queued |

`params` itself is optional — `start()` can be called with zero arguments.

```typescript
AppsFlyer.registerSessionReadyListener(() => {
  AppsFlyer.start();
});
```

### stop

`stop(params) : Promise<void>`

Shuts down all SDK functions — for legal/privacy opt-out flows. Once called, the SDK stops
communicating with AppsFlyer's servers. Call again with `false` to reactivate.

| parameter | type | description |
| --- | --- | --- |
| shouldStop | boolean | true to stop the SDK |

```typescript
await AppsFlyer.stop({ shouldStop: true });
```

### enableDebug

`enableDebug(params) : Promise<void>`

Enables native SDK debug logging. Not order-critical relative to `init` — call it as early as
possible (even before `init`) to get full debug logs from the start of the session.

| parameter | type | description |
| --- | --- | --- |
| enabled | boolean | true to enable debug logs |

```typescript
await AppsFlyer.enableDebug({ enabled: true });
```

### logEvent

`logEvent(params) : Promise<void>`

Records an in-app event — see [`docs/InAppEvents.md`](InAppEvents.md) for usage, and AppsFlyer's
[rich in-app events guide](https://support.appsflyer.com/hc/en-us/articles/115005544169-Rich-in-app-events-guide)
for event naming rules (45-character limit) and predefined event names.

| parameter | type | description |
| --- | --- | --- |
| eventName | string | the event name |
| eventValues | object | optional; event values sent with the event |
| awaitResponse | boolean | optional; by default resolves once the SDK queues the event, not once it reaches AppsFlyer's server — pass `true` to wait for the native SDK's own completion handler |

```typescript
await AppsFlyer.logEvent({
  eventName: 'af_add_to_cart',
  eventValues: { af_content_id: 'id123', af_currency: 'USD', af_revenue: 2 },
});
```

### setCustomerUserId

`setCustomerUserId(params) : Promise<void>`

Sets your own customer user ID so it can be cross-referenced with AppsFlyer's ID in raw data
reports and postbacks. Call before `start()` if you want it on the install event; otherwise call
it any time.

| parameter | type | description |
| --- | --- | --- |
| customerId | string | your user ID |

```typescript
await AppsFlyer.setCustomerUserId({ customerId: 'some_user_id' });
```

### setAppInviteOneLink

`setAppInviteOneLink(params) : Promise<void>`

Sets the OneLink ID used as the base link for User Invite.

| parameter | type | description |
| --- | --- | --- |
| oneLinkId | string | the OneLink ID |

```typescript
await AppsFlyer.setAppInviteOneLink({ oneLinkId: 'abcd' });
```

### setAdditionalData

`setAdditionalData(params) : Promise<void>`

Sends additional data required to integrate with certain external partner platforms (Segment,
Adobe, Urban Airship). Only use this if the partner's integration article specifically calls for
it.

| parameter | type | description |
| --- | --- | --- |
| customData | object | additional data |

```typescript
await AppsFlyer.setAdditionalData({
  customData: { val1: 'data1', val2: false, val3: 23 },
});
```

### setResolveDeepLinkURLs

`setResolveDeepLinkURLs(params) : Promise<void>`

Sets ESP (email service provider) domains that wrap your deep links, so the SDK resolves them
back to the original deep link. Call during SDK initialization. See
[the AppsFlyer docs](https://support.appsflyer.com/hc/en-us/articles/360001409618-Email-service-provider-challenges-with-iOS-Universal-links).

| parameter | type | description |
| --- | --- | --- |
| urls | string[] | ESP domains requiring resolving |

```typescript
await AppsFlyer.setResolveDeepLinkURLs({ urls: ['click.esp-domain.com'] });
```

### setOneLinkCustomDomain

`setOneLinkCustomDomain(params) : Promise<void>`

Sets OneLink custom/branded domains. Call during SDK initialization. See
[the AppsFlyer docs](https://support.appsflyer.com/hc/en-us/articles/360002329137-Implementing-Branded-Links).

| parameter | type | description |
| --- | --- | --- |
| domains | string[] | branded domains |

```typescript
await AppsFlyer.setOneLinkCustomDomain({ domains: ['click.mybrand.com'] });
```

### setCurrencyCode

`setCurrencyCode(params) : Promise<void>`

Sets the local currency code applied to logged in-app purchase events. A 3-character ISO 4217
code (default is USD).

| parameter | type | description |
| --- | --- | --- |
| currencyCode | string | ISO 4217 currency code |

```typescript
await AppsFlyer.setCurrencyCode({ currencyCode: 'USD' });
```

### logLocation

`logLocation(params) : Promise<void>`

Manually records the user's location.

| parameter | type | description |
| --- | --- | --- |
| latitude | number | latitude |
| longitude | number | longitude |

```typescript
await AppsFlyer.logLocation({ latitude: -18.406655, longitude: 46.40625 });
```

### anonymizeUser

`anonymizeUser(params) : Promise<void>`

Anonymizes specific user identifiers within AppsFlyer analytics, for GDPR/COPPA and Facebook data
policy compliance.

| parameter | type | description |
| --- | --- | --- |
| shouldAnonymize | boolean | true to anonymize the user's data (default is false) |

```typescript
await AppsFlyer.anonymizeUser({ shouldAnonymize: true });
```

### getAppsFlyerUID

`getAppsFlyerUID() : Promise<string | null>`

Returns AppsFlyer's unique device ID, created on every new install.

```typescript
const uid = await AppsFlyer.getAppsFlyerUID();
```

### getSdkVersion

`getSdkVersion() : Promise<string>`

Returns the native AppsFlyer SDK version the plugin is bundling.

```typescript
const version = await AppsFlyer.getSdkVersion();
```

### setHost

`setHost(params) : Promise<void>`

Sets a custom host.

| parameter | type | description |
| --- | --- | --- |
| hostPrefixName | string | the host prefix |
| hostName | string | the host name |

```typescript
await AppsFlyer.setHost({ hostPrefixName: 'foo', hostName: 'bar.appsflyer.com' });
```

### setUserEmail

`setUserEmail(params) : Promise<void>`

Sets the user's email. Hashed by the native SDK before transmission.

| parameter | type | description |
| --- | --- | --- |
| email | string | the user's email address |

```typescript
await AppsFlyer.setUserEmail({ email: 'user1@gmail.com' });
```

### setUserPhone

`setUserPhone(params) : Promise<void>`

Sets the user's phone number. Hashed by the native SDK before transmission. The native SDK takes
a split country code and subscriber number — a single combined string isn't supported.

| parameter | type | description |
| --- | --- | --- |
| countryCode | string | country code, e.g. `'1'` or `'+1'` |
| phoneNumber | string | subscriber number, without the country code |

```typescript
await AppsFlyer.setUserPhone({ countryCode: '1', phoneNumber: '5551234567' });
```

### setUserFirstName

`setUserFirstName(params) : Promise<void>`

Sets the user's first name. Hashed by the native SDK before transmission.

| parameter | type | description |
| --- | --- | --- |
| firstName | string | the user's first name |

```typescript
await AppsFlyer.setUserFirstName({ firstName: 'Jane' });
```

### setUserLastName

`setUserLastName(params) : Promise<void>`

Sets the user's last name. Hashed by the native SDK before transmission.

| parameter | type | description |
| --- | --- | --- |
| lastName | string | the user's last name |

```typescript
await AppsFlyer.setUserLastName({ lastName: 'Doe' });
```

### setUserFbLoginId

`setUserFbLoginId(params) : Promise<void>`

Sets the user's Facebook login ID. Facebook login IDs run 15-18 digits, past JavaScript's 53-bit
safe-integer range — pass a numeric **string** for IDs at or near 2^53 so native parses it with
full precision instead of a value that's already lost precision on the JS side.

| parameter | type | description |
| --- | --- | --- |
| fbLoginId | string \| number | numeric Facebook login ID — use a string for IDs at or near 2^53 |

```typescript
await AppsFlyer.setUserFbLoginId({ fbLoginId: '1234567890' }); // safe for any length
```

### clearUserPii

`clearUserPii() : Promise<void>`

Clears all previously set hashed PII (phone, first/last name, Facebook login ID, email). Takes no
arguments.

```typescript
await AppsFlyer.clearUserPii();
```

### generateInviteLink

`generateInviteLink(params?) : Promise<string>`

Generates a User Invite link. A full list of supported parameters is available
[here](https://support.appsflyer.com/hc/en-us/articles/115004480866-User-Invite-Tracking); custom
parameters go in the nested `userParams` object.

| parameter | type | description |
| --- | --- | --- |
| parameters | object | optional; `{ channel?, campaign?, referrerName?, referrerImageUrl?, referrerCustomerId?, baseDeepLink?, brandDomain?, userParams? }` |
| awaitResponse | boolean | optional |

```typescript
const link = await AppsFlyer.generateInviteLink({
  parameters: {
    channel: 'gmail',
    campaign: 'myCampaign',
    referrerCustomerId: '1234',
    userParams: { myParam: 'newUser', anotherParam: 'fromWeb', amount: 1 },
  },
});
```

### logInvite

`logInvite(params) : Promise<void>`

Logs a user-invite event.

| parameter | type | description |
| --- | --- | --- |
| channel | string | the channel the invite was sent through |
| eventParameters | object | optional; additional event parameters |

```typescript
await AppsFlyer.logInvite({ channel: 'facebook', eventParameters: { af_content_id: 'id123' } });
```

### logCrossPromoteImpression

`logCrossPromoteImpression(params) : Promise<void>`

Attributes an impression for a cross-promotion. Use the promoted app's ID as it appears in the
AppsFlyer dashboard. Note this method names the parameter `appId`, while `logAndOpenStore` below
names the same concept `promotedAppId` — a historical naming inconsistency in the underlying API,
not a typo.

| parameter | type | description |
| --- | --- | --- |
| appId | string | promoted app ID |
| campaign | string | optional; cross-promotion campaign |
| userParams | object | optional; additional params added to the attribution link |

```typescript
await AppsFlyer.logCrossPromoteImpression({ appId: '123456789', campaign: 'myCampaign' });
```

### logAndOpenStore

`logAndOpenStore(params) : Promise<void>`

Attributes a cross-promotion click and launches the app store's app page.

| parameter | type | description |
| --- | --- | --- |
| promotedAppId | string | promoted app ID |
| campaign | string | optional; cross-promotion campaign |
| userParams | object | optional; additional user params |

```typescript
await AppsFlyer.logAndOpenStore({ promotedAppId: '123456789', campaign: 'myCampaign' });
```

### setSharingFilterForPartners

`setSharingFilterForPartners(params) : Promise<void>`

Excludes networks/integrated partners from receiving data.

| parameter | type | description |
| --- | --- | --- |
| partners | string[] \| null | partners to exclude; `['all']` excludes every partner, `null`/`[]` resets the filter |

```typescript
await AppsFlyer.setSharingFilterForPartners({ partners: ['facebook_int', 'googleadwords_int'] });
```

### setPartnerData

`setPartnerData(params) : Promise<void>`

Sends custom data for a partner integration.

| parameter | type | description |
| --- | --- | --- |
| partnerId | string | ID of the partner (usually suffixed with `_int`) |
| data | object | data expected by that partner's integration |

```typescript
await AppsFlyer.setPartnerData({ partnerId: 'example_partner_int', data: { key: 'value' } });
```

### validateAndLogInAppPurchase

`validateAndLogInAppPurchase(params) : Promise<Record<string, unknown>>`

Asks the payment platform (Apple or Google) to validate that an in-app purchase actually
occurred. See [Receipt validation](https://support.appsflyer.com/hc/en-us/articles/207032106-Receipt-validation-for-in-app-purchases).
❗ On iOS, call [`setUseReceiptValidationSandbox`](#setusereceiptvalidationsandbox) with `true`
first when testing against Apple's sandbox.

| parameter | type | description |
| --- | --- | --- |
| purchase | object | `{ purchaseType, productId, purchaseToken }` on Android, `{ purchaseType, productId, transactionId }` on iOS — the two platforms report different native purchase identifiers, so the shape is per-platform, not shared |
| additionalParameters | object | optional |

`purchaseType` is `AFPurchaseType.subscription` or `AFPurchaseType.oneTimePurchase`, exported from
this plugin (`import { AFPurchaseType } from 'appsflyer-capacitor-plugin'`).

A 401/500 logged via `console.warn` after calling this means the app isn't registered for
purchase validation on the server side — expected, not a bridge failure.

```typescript
import { AppsFlyer, AFPurchaseType } from 'appsflyer-capacitor-plugin';
import { Capacitor } from '@capacitor/core';

const additionalParameters = { revenue: 9.99, currency: 'USD' };

if (Capacitor.getPlatform() === 'ios') {
  await AppsFlyer.validateAndLogInAppPurchase({
    purchase: {
      productId: 'deviceIdconsumableid',
      transactionId: '2000000569065806',
      purchaseType: AFPurchaseType.oneTimePurchase,
    },
    additionalParameters,
  });
} else {
  await AppsFlyer.validateAndLogInAppPurchase({
    purchase: {
      productId: 'deviceIdconsumableid',
      purchaseToken: 'purchase-token-from-billing-client',
      purchaseType: AFPurchaseType.oneTimePurchase,
    },
    additionalParameters,
  });
}
```

### updateServerUninstallToken

`updateServerUninstallToken(params) : Promise<void>`

Manually passes the Firebase/GCM device token for uninstall measurement.

| parameter | type | description |
| --- | --- | --- |
| token | string | FCM token |

```typescript
await AppsFlyer.updateServerUninstallToken({ token: 'token' });
```

### sendPushNotificationData

`sendPushNotificationData(params) : Promise<void>` — Android only

Processes a push-notification payload for re-engagement measurement. Call while the app's
activity is available (not in a dead state). iOS uses
[`handlePushNotification`](#handlepushnotification) instead — no single merged call across
platforms. See [Measuring Push Notification Re-Engagement Campaigns](https://support.appsflyer.com/hc/en-us/articles/207364076-Measuring-Push-Notification-Re-Engagement-Campaigns).

| parameter | type | description |
| --- | --- | --- |
| campaign | string | campaign name |
| pid | string | media source identifier |
| isRetargeting | boolean | optional; true for a re-engagement |
| additionalParameters | object | optional; additional campaign parameters |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  await AppsFlyer.sendPushNotificationData({
    campaign: 'test_campaign',
    pid: 'push_provider_int',
    isRetargeting: true,
  });
}
```

### handlePushNotification

`handlePushNotification(params) : Promise<void>` — iOS only

Forwards a raw push-notification payload to the native SDK, which locates the `af` block itself.
Android uses [`sendPushNotificationData`](#sendpushnotificationdata) instead.

| parameter | type | description |
| --- | --- | --- |
| pushPayload | object | the raw push-notification payload |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'ios') {
  await AppsFlyer.handlePushNotification({
    pushPayload: {
      af: { c: 'test_campaign', is_retargeting: true, pid: 'push_provider_int' },
      aps: { alert: 'Get 5000 Coins', badge: '37', sound: 'default' },
    },
  });
}
```

### addPushNotificationDeepLinkPath

`addPushNotificationDeepLinkPath(params) : Promise<void>`

Adds an array of keys used to compose the JSON key path that resolves a deep link out of a push
notification payload — e.g. `['deeply', 'nested', 'deep_link']` matches
`{ deeply: { nested: { deep_link: 'https://...' } } }`.

| parameter | type | description |
| --- | --- | --- |
| deepLinkPath | string[] | JSON path segments to the deep link value |

```typescript
await AppsFlyer.addPushNotificationDeepLinkPath({ deepLinkPath: ['deeply', 'nested', 'deep_link'] });
```

### appendParametersToDeepLinkingURL

`appendParametersToDeepLinkingURL(params) : Promise<void>`

Matches URLs containing `contains` as a substring and appends query parameters to them; URLs that
don't match are left untouched. `parameters` must be `string` → `string`. Call this **before**
`init()`. Must include `pid` and `is_retargeting: 'true'`.

| parameter | type | description |
| --- | --- | --- |
| contains | string | substring to match against the URL |
| parameters | Record\<string, string\> | parameters to append once the URL matches |

```typescript
await AppsFlyer.appendParametersToDeepLinkingURL({
  contains: 'substring-of-url',
  parameters: { param1: 'value', pid: 'value2', is_retargeting: 'true' },
});
```

### setDisableAdvertisingIdentifiers

`setDisableAdvertisingIdentifiers(params) : Promise<void>`

Disables collection of advertising IDs — GAID/OAID/AAID on Android, IDFA on iOS.

| parameter | type | description |
| --- | --- | --- |
| disable | boolean | true to disable advertising ID collection |

```typescript
await AppsFlyer.setDisableAdvertisingIdentifiers({ disable: true });
```

### enableTCFDataCollection

`enableTCFDataCollection(params) : Promise<void>`

Instructs the SDK to collect TCF (Transparency and Consent Framework) data from the device.

| parameter | type | description |
| --- | --- | --- |
| shouldCollect | boolean | enable/disable TCF data collection |

```typescript
await AppsFlyer.enableTCFDataCollection({ shouldCollect: true });
```

### setConsentData

`setConsentData(params) : Promise<void>`

When GDPR applies and your app doesn't use a TCF v2.2/2.3-compatible CMP, use this to provide
consent data directly. `isUserSubjectToGDPR` is required — there's no client-side default.

| parameter | type | description |
| --- | --- | --- |
| isUserSubjectToGDPR | boolean | whether GDPR applies to the user (required) |
| hasConsentForDataUsage | boolean | optional; consent for data usage |
| hasConsentForAdsPersonalization | boolean | optional; consent for ads personalization |
| hasConsentForAdStorage | boolean | optional; consent for ad storage |

```typescript
await AppsFlyer.setConsentData({
  isUserSubjectToGDPR: true,
  hasConsentForDataUsage: true,
  hasConsentForAdsPersonalization: true,
  hasConsentForAdStorage: true,
});
```

### logAdRevenue

`logAdRevenue(params) : Promise<void>`

Logs ad revenue (rewarded videos, offer walls, interstitials, banners), giving app owners full
visibility into user LTV and campaign ROI.

| parameter | type | description |
| --- | --- | --- |
| monetizationNetwork | string | the monetization network name |
| mediationNetwork | `MediationNetwork` | the mediation network — exported enum, `import { MediationNetwork } from 'appsflyer-capacitor-plugin'` |
| currencyIso4217Code | string | ISO 4217 currency code |
| revenue | number | revenue amount |
| additionalParameters | object | optional; any extra data to log with the event |

```typescript
import { AppsFlyer, MediationNetwork } from 'appsflyer-capacitor-plugin';

await AppsFlyer.logAdRevenue({
  monetizationNetwork: 'AF-AdNetwork',
  mediationNetwork: MediationNetwork.IRONSOURCE,
  currencyIso4217Code: 'USD',
  revenue: 1.23,
  additionalParameters: { customParam1: 'value1' },
});
```

### setMinTimeBetweenSessions

`setMinTimeBetweenSessions(params) : Promise<void>`

Sets the minimum time that must elapse between app launches for a new session to count.

| parameter | type | description |
| --- | --- | --- |
| seconds | number | minimum seconds between sessions |

```typescript
await AppsFlyer.setMinTimeBetweenSessions({ seconds: 10 });
```

### setInstallId

`setInstallId(params) : Promise<void>`

Overrides the AppsFlyer-generated install ID with a custom identifier.

| parameter | type | description |
| --- | --- | --- |
| installId | string | custom install ID |

```typescript
await AppsFlyer.setInstallId({ installId: 'custom-install-id' });
```

### setDeepLinkTimeout

`setDeepLinkTimeout(params) : Promise<void>`

Sets how long the SDK waits to resolve a deep link before giving up.

| parameter | type | description |
| --- | --- | --- |
| timeout | number | deep link resolution timeout, in milliseconds |

```typescript
await AppsFlyer.setDeepLinkTimeout({ timeout: 5000 });
```

### enableFacebookDeferredApplinks

`enableFacebookDeferredApplinks(params) : Promise<void>`

Enables or disables resolution of Facebook deferred app links.

| parameter | type | description |
| --- | --- | --- |
| isEnabled | boolean | true to enable Facebook deferred app link resolution |

```typescript
await AppsFlyer.enableFacebookDeferredApplinks({ isEnabled: true });
```

### setPluginInfo (internal)

`setPluginInfo` reports plugin identity (`plugin: 'capacitor'`, `pluginVersion`) to the native
SDK. It is **not** a method you call — `AppsFlyerSDK`'s constructor dispatches it automatically
on every `init()`, using the identity this package registers itself with. Listed here only
because it appears on the wire, for parity with the RPC map.

### Android only

#### setAndroidIdData

`setAndroidIdData(params) : Promise<void>` — Android only

Reports a caller-supplied Android ID to the SDK, for apps that already collect it themselves.
Android ID is a persistent device identifier — confirm your app has the necessary user consent
before collecting it, and avoid logging the raw value. Google Play policy restricts Android ID
collection for apps with Play Services — review that policy and apply GDPR data-minimization
principles before relying on this setter. To opt out of SDK collection of Android ID, see
[setCollectAndroidID](#setcollectandroidid). This value must never be written to debug logs or
crash/analytics reports, and must be declared in your app's
[Play Data Safety section](https://support.google.com/googleplay/android-developer/answer/10787469).

| parameter | type | description |
| --- | --- | --- |
| androidId | string | the device's Android ID |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  await AppsFlyer.setAndroidIdData({ androidId: 'REPLACE_WITH_ANDROID_ID' });
}
```

#### setCollectAndroidID

`setCollectAndroidID(params) : Promise<void>` — Android only

Opts out of Android ID collection. If the app has no Google Play Services, Android ID is
collected regardless; apps with Play Services should avoid collecting it — doing so violates
Google Play policy.

| parameter | type | description |
| --- | --- | --- |
| isCollect | boolean | opt-in flag |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  await AppsFlyer.setCollectAndroidID({ isCollect: true });
}
```

#### setImeiData

`setImeiData(params) : Promise<void>` — Android only

Reports a caller-supplied IMEI to the SDK, for apps that already collect it themselves. IMEI is
a persistent device identifier — confirm your app has the necessary user consent before
collecting it, and avoid logging the raw value. On Android 10+ (API 29+) the platform itself
blocks apps without carrier privileges from reading the device IMEI, and Google Play's
[Permissions and APIs that Access Sensitive Information policy](https://support.google.com/googleplay/android-developer/answer/9888077)
limits IMEI collection to a narrow set of eligible app categories — review that policy and apply
GDPR data-minimization principles before relying on this setter. Most consumer apps targeting
Android 10+ will not have access to IMEI; this setter is primarily intended for carrier-privileged
apps, device-owner/enterprise deployments, or apps targeting legacy Android versions. This value
must never be written to debug logs or crash/analytics reports, and must be declared in your
app's
[Play Data Safety section](https://support.google.com/googleplay/android-developer/answer/10787469).

| parameter | type | description |
| --- | --- | --- |
| imei | string | the device's IMEI |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  await AppsFlyer.setImeiData({ imei: 'REPLACE_WITH_DEVICE_IMEI' });
}
```

#### setOaidData

`setOaidData(params) : Promise<void>` — Android only

Reports a caller-supplied OAID (Open Anonymous Device Identifier) to the SDK, for apps that
already collect it themselves. OAID is a persistent device identifier used on non-GMS Android
devices (e.g. Huawei via AppGallery, or markets where Google Play Services are not present) —
confirm your app has the necessary user consent before collecting it, and avoid logging the raw
value. Apply GDPR data-minimization principles before relying on this setter. This value must
never be written to debug logs or crash/analytics reports, and must be declared in your app's
privacy disclosures, such as Huawei AppGallery data privacy declarations.

| parameter | type | description |
| --- | --- | --- |
| oaid | string | the device's OAID |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  await AppsFlyer.setOaidData({ oaid: 'REPLACE_WITH_DEVICE_OAID' });
}
```

#### setDisableNetworkData

`setDisableNetworkData(params) : Promise<void>` — Android only

Opts out of collecting the device's network/SIM operator name.

| parameter | type | description |
| --- | --- | --- |
| isDisable | boolean | defaults to false |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  await AppsFlyer.setDisableNetworkData({ isDisable: true });
}
```

#### performDeepLinking

`performDeepLinking(params) : Promise<void>`

Manually triggers deep-link resolution for a given URL — for apps that delay `start()` but still
want to resolve deep links first. Triggers the `registerDeepLinkListener` callback; check
`res.status === 'FOUND'` there to read the resolved params. Same wire method on both platforms,
but `shouldTriggerSession` is Android-only.

| parameter | type | description |
| --- | --- | --- |
| url | string | the deep link URL to resolve |
| shouldTriggerSession | boolean | Android only; whether resolution also starts a session. Optional, defaults to false |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  await AppsFlyer.performDeepLinking({ url: deepLinkUrl, shouldTriggerSession: true });
} else {
  await AppsFlyer.performDeepLinking({ url: deepLinkUrl });
}
```

#### disableAppSetId

`disableAppSetId() : Promise<void>` — Android only

Disables collection of AppSet ID. Must be called before `init()`. Takes no arguments.

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  await AppsFlyer.disableAppSetId();
}
await AppsFlyer.init({ devKey: 'K2***********99', appId: '41*****44' });
```

#### getHostName

`getHostName() : Promise<string | null>`

Returns the currently configured custom host name (see [`setHost`](#sethost)).

```typescript
const hostName = await AppsFlyer.getHostName();
```

#### getHostPrefix

`getHostPrefix() : Promise<string | null>`

Returns the currently configured custom host prefix (see [`setHost`](#sethost)).

```typescript
const hostPrefix = await AppsFlyer.getHostPrefix();
```

#### getOutOfStore

`getOutOfStore() : Promise<string | null>` — Android only

Returns the currently configured out-of-store source name.

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  const outOfStore = await AppsFlyer.getOutOfStore();
}
```

#### setOutOfStore

`setOutOfStore(params) : Promise<void>` — Android only

Reports an out-of-store source (e.g. an alternative app store) for attribution.

| parameter | type | description |
| --- | --- | --- |
| sourceName | string | the out-of-store source name |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  await AppsFlyer.setOutOfStore({ sourceName: 'my-app-store' });
}
```

#### getAttributionId

`getAttributionId() : Promise<string | null>` — Android only

Returns the Google Play install-referrer attribution ID.

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  const attributionId = await AppsFlyer.getAttributionId();
}
```

#### isStopped

`isStopped() : Promise<boolean>`

Returns whether the SDK is currently stopped (see [`stop`](#stop)).

```typescript
const stopped = await AppsFlyer.isStopped();
```

#### isPreInstalledApp

`isPreInstalledApp() : Promise<boolean>` — Android only

Returns whether the app was pre-installed on the device.

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  const isPreInstalled = await AppsFlyer.isPreInstalledApp();
}
```

#### setLogLevel

`setLogLevel(params) : Promise<void>` — Android only

Sets the native SDK's log verbosity.

| parameter | type | description |
| --- | --- | --- |
| logLevel | `'none' \| 'error' \| 'warning' \| 'info' \| 'debug' \| 'verbose'` | the native SDK's log level |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  await AppsFlyer.setLogLevel({ logLevel: 'debug' });
}
```

#### setIsUpdate

`setIsUpdate(params) : Promise<void>` — Android only

Marks the current install as an update rather than a fresh install (testing aid).

| parameter | type | description |
| --- | --- | --- |
| isUpdate | boolean | true to mark as an update |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  await AppsFlyer.setIsUpdate({ isUpdate: true });
}
```

#### setAppId

`setAppId(params) : Promise<void>` — Android only

Overrides the app ID reported to AppsFlyer, for apps whose package name differs from their store
listing ID.

| parameter | type | description |
| --- | --- | --- |
| appId | string | the app ID |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  await AppsFlyer.setAppId({ appId: 'com.example.app' });
}
```

#### setPreinstallAttribution

`setPreinstallAttribution(params) : Promise<void>` — Android only

Reports pre-install attribution for apps bundled directly onto a device (OEM deals).

| parameter | type | description |
| --- | --- | --- |
| mediaSource | string | the media source |
| campaign | string | optional; the campaign name |
| siteId | string | optional; the site ID |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  await AppsFlyer.setPreinstallAttribution({ mediaSource: 'mediaSource', campaign: 'campaign', siteId: 'siteId' });
}
```

#### logSession

`logSession() : Promise<void>` — Android only

Explicitly logs a new session. Takes no arguments.

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  await AppsFlyer.logSession();
}
```

#### onPause

`onPause() : Promise<void>` — Android only

Call when your Activity pauses. Takes no arguments.

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  await AppsFlyer.onPause();
}
```

#### collectDataFromLauncherActivity

`collectDataFromLauncherActivity() : Promise<void>` — Android only

Collects referrer data from the app's launcher activity. Takes no arguments.

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  await AppsFlyer.collectDataFromLauncherActivity();
}
```

#### unregisterConversionListener

`unregisterConversionListener() : Promise<void>` — Android only

Stops the native conversion listener and clears registered callbacks. iOS has no RPC equivalent.
Takes no arguments.

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  await AppsFlyer.unregisterConversionListener();
}
```

#### unregisterDeepLinkListener

`unregisterDeepLinkListener() : Promise<void>` — Android only

Stops the native deep-link listener and clears registered callbacks. Takes no arguments.

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  await AppsFlyer.unregisterDeepLinkListener();
}
```

### iOS only

#### setDisableCollectASA

`setDisableCollectASA(params) : Promise<void>` — iOS only

Disables Apple Search Ads data collection.

| parameter | type | description |
| --- | --- | --- |
| disable | boolean | flag to disable/enable ASA data collection |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'ios') {
  await AppsFlyer.setDisableCollectASA({ disable: true });
}
```

#### setDisableAppleAdsAttribution

`setDisableAppleAdsAttribution(params) : Promise<void>` — iOS only

Disables Apple Ads attribution.

| parameter | type | description |
| --- | --- | --- |
| disable | boolean | flag to disable/enable Apple Ads attribution |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'ios') {
  await AppsFlyer.setDisableAppleAdsAttribution({ disable: true });
}
```

#### setDisableIDFVCollection

`setDisableIDFVCollection(params) : Promise<void>` — iOS only

Disables collection of the app vendor identifier (IDFV). Default is false (IDFV collected).

| parameter | type | description |
| --- | --- | --- |
| disable | boolean | flag to disable/enable IDFV collection |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'ios') {
  await AppsFlyer.setDisableIDFVCollection({ disable: true });
}
```

#### setUseReceiptValidationSandbox

`setUseReceiptValidationSandbox(params) : Promise<void>` — iOS only

Sets the Apple in-app-purchase receipt validation environment (production or sandbox). Default
is false.

| parameter | type | description |
| --- | --- | --- |
| sandbox | boolean | true to validate against Apple's sandbox |

```typescript
await AppsFlyer.setUseReceiptValidationSandbox({ sandbox: true });
```

#### setUseUninstallSandbox

`setUseUninstallSandbox(params) : Promise<void>` — iOS only

Uses the sandbox endpoint for uninstall-token registration.

| parameter | type | description |
| --- | --- | --- |
| sandbox | boolean | true to use the sandbox uninstall-token endpoint |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'ios') {
  await AppsFlyer.setUseUninstallSandbox({ sandbox: true });
}
```

#### setDisableSKAdNetwork

`setDisableSKAdNetwork(params) : Promise<void>` — iOS only

❗ Must be called **before** `init()`.

| parameter | type | description |
| --- | --- | --- |
| disable | boolean | true to disable SKAdNetwork |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'ios') {
  await AppsFlyer.setDisableSKAdNetwork({ disable: true });
}
```

#### setCurrentDeviceLanguage

`setCurrentDeviceLanguage(params) : Promise<void>` — iOS only

Sets the device's language, shown in raw data reports. Pass `''` to clear it.

| parameter | type | description |
| --- | --- | --- |
| language | string | the device's language |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'ios') {
  await AppsFlyer.setCurrentDeviceLanguage({ language: 'EN' });
}
```

#### setShouldCollectDeviceName

`setShouldCollectDeviceName(params) : Promise<void>` — iOS only

Enables or disables collection of the device's name.

| parameter | type | description |
| --- | --- | --- |
| collect | boolean | true to enable device-name collection |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'ios') {
  await AppsFlyer.setShouldCollectDeviceName({ collect: true });
}
```

#### handleOpenURL

`handleOpenURL(params) : Promise<void>` — iOS only

Forwards your app's `application(_:open:options:)` URL-open event to the native SDK from JS —
the escape hatch for apps that don't wire this natively. See
[`docs/DeepLink.md`](DeepLink.md) for the native-side call this replaces.

| parameter | type | description |
| --- | --- | --- |
| url | string | the opened URL |
| options | object | optional; iOS open-URL options dictionary |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'ios') {
  await AppsFlyer.handleOpenURL({ url, options });
}
```

#### handleOpenUrl

`handleOpenUrl(params) : Promise<void>` — iOS only

Same purpose as [`handleOpenURL`](#handleopenurl) — kept as a separate case-variant method to
match the native RPC surface.

| parameter | type | description |
| --- | --- | --- |
| url | string | the opened URL |
| options | object | optional; iOS open-URL options dictionary |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'ios') {
  await AppsFlyer.handleOpenUrl({ url, options });
}
```

#### continueUserActivity

`continueUserActivity(params) : Promise<void>` — iOS only

Forwards your app's `application(_:continue:restorationHandler:)` universal-link activity to the
native SDK from JS — the escape hatch for apps that don't wire this natively. See
[`docs/DeepLink.md`](DeepLink.md).

| parameter | type | description |
| --- | --- | --- |
| url | string | the activity's `webpageURL` |
| activityType | string | optional; the `NSUserActivity` type |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'ios') {
  await AppsFlyer.continueUserActivity({ url });
}
```

#### handleLaunchOptions

`handleLaunchOptions(params?) : Promise<void>` — iOS only

Forwards your app's cold-start `didFinishLaunchingWithOptions` payload to the native SDK from
JS — needed for cold-start deep-link/attribution resolution. See [`docs/DeepLink.md`](DeepLink.md).

| parameter | type | description |
| --- | --- | --- |
| launchOptions | object | the launch-options dictionary; pass `{}` if you have nothing to forward |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'ios') {
  await AppsFlyer.handleLaunchOptions({ launchOptions });
}
```

#### setFacebookDeferredAppLink

`setFacebookDeferredAppLink(params) : Promise<void>` — iOS only

Explicitly resolves a Facebook deferred app link from the app's `open(url:options:)` payload.

| parameter | type | description |
| --- | --- | --- |
| url | string \| null | the Facebook deferred app link URL |

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'ios') {
  await AppsFlyer.setFacebookDeferredAppLink({ url });
}
```

### Listener registration

#### registerConversionListener

`registerConversionListener(callbacks) : Promise<void>`

Subscribes to attribution/conversion data (deferred deep linking). Call synchronously right after
`init()`, not inside `init().then(...)` — see [Listeners](#listeners). Both callbacks are
optional individually, but native's own listener interface implements both unconditionally on
each platform, so both fire — pass a no-op for one if you only care about the other.

| parameter | type | description |
| --- | --- | --- |
| onConversionDataSuccess | function | optional; receives the conversion data (`ConversionData`) |
| onConversionDataFail | function | optional; receives the failure |

```typescript
await AppsFlyer.init({ devKey: 'YOUR_DEV_KEY', appId: 'YOUR_APP_ID' });

AppsFlyer.registerConversionListener({
  onConversionDataSuccess: (data) => {
    if (data.is_first_launch && data.af_status === 'Non-organic') {
      console.log('Non-organic install', data.media_source, data.campaign);
    }
  },
  onConversionDataFail: (error) => console.error(error),
});
```

The callback receives the conversion-data object directly — not wrapped in a `{data, status,
type}` envelope. Stop the listener with [`unregisterConversionListener`](#unregisterconversionlistener)
(Android only).

#### registerDeepLinkListener

`registerDeepLinkListener(callbacks) : Promise<void>`

Subscribes to Unified Deep Linking (UDL) results, including app-open attribution. Call **before**
`init()`, on both platforms — see [Listeners](#listeners).

| parameter | type | description |
| --- | --- | --- |
| onDeepLinking | function | optional; receives `DeepLinkData` |

```typescript
AppsFlyer.registerDeepLinkListener({
  onDeepLinking: (data) => {
    if (data.status === 'FOUND') {
      console.log(data.deepLink);
    } else if (data.status === 'ERROR') {
      console.error(data.error);
    }
  },
});
```

`data.status` is `'FOUND' | 'NOT_FOUND' | 'ERROR'`. Stop the listener with
[`unregisterDeepLinkListener`](#unregisterdeeplinklistener) (Android only).

#### registerSessionReadyListener

`registerSessionReadyListener(callback) : Promise<void>`

Fires once the native SDK's session is ready to serve attribution/deep-link data. Must be
registered synchronously, before `init()`'s promise settles — see
[Session-ready ordering](#session-ready-ordering). Net-new in 7.0.0.

| parameter | type | description |
| --- | --- | --- |
| callback | function | invoked with no arguments when the session becomes ready |

```typescript
AppsFlyer.registerSessionReadyListener(() => {
  AppsFlyer.start();
});
```

#### isSessionReady

`isSessionReady() : Promise<boolean>`

Queries whether the session is currently ready — a one-off Promise check, not a replacement for
[`registerSessionReadyListener`](#registersessionreadylistener). Net-new in 7.0.0.

```typescript
const ready = await AppsFlyer.isSessionReady();
```

#### unregisterSessionReadyListener

`unregisterSessionReadyListener() : Promise<void>`

Removes a previously registered session-ready listener. Takes no arguments. Net-new in 7.0.0.

```typescript
await AppsFlyer.unregisterSessionReadyListener();
```

## Migrating from 6.x

Moved to [`MIGRATION.md`](../MIGRATION.md) at the repo root — the full 6.x → 7.x method/argument
mapping, per-change detail sections, and a ready-to-use prompt for an LLM coding assistant. This
page (the method reference above) is the source of truth for exact 7.x param shapes; `MIGRATION.md`
is the diff against 6.x.

See also: [`docs/AdvancedAPI.md`](AdvancedAPI.md), [`docs/DeepLink.md`](DeepLink.md),
[`docs/InAppEvents.md`](InAppEvents.md), [`docs/BasicIntegration.md`](BasicIntegration.md).
