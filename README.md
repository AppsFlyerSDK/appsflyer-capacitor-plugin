# appsflyer-capacitor-plugin

AppsFlyer SDK plugin for Capacitor

## Install

```bash
npm install appsflyer-capacitor-plugin
npx cap sync
```

## API

<docgen-index>

* [`addListener(...)`](#addlistener)
* [`addListener(...)`](#addlistener)
* [`addListener(...)`](#addlistener)
* [`initSDK(...)`](#initsdk)
* [`logEvent(...)`](#logevent)
* [`setCustomerUserId(...)`](#setcustomeruserid)
* [`setCurrencyCode(...)`](#setcurrencycode)
* [`updateServerUninstallToken(...)`](#updateserveruninstalltoken)
* [`setAppInviteOneLink(...)`](#setappinviteonelink)
* [`setOneLinkCustomDomain(...)`](#setonelinkcustomdomain)
* [`appendParametersToDeepLinkingURL(...)`](#appendparameterstodeeplinkingurl)
* [`setResolveDeepLinkURLs(...)`](#setresolvedeeplinkurls)
* [`addPushNotificationDeepLinkPath(...)`](#addpushnotificationdeeplinkpath)
* [`setSharingFilter(...)`](#setsharingfilter)
* [`setSharingFilterForAllPartners()`](#setsharingfilterforallpartners)
* [`setAdditionalData(...)`](#setadditionaldata)
* [`getAppsFlyerUID()`](#getappsflyeruid)
* [`anonymizeUser(...)`](#anonymizeuser)
* [`stop(...)`](#stop)
* [`disableSKAdNetwork(...)`](#disableskadnetwork)
* [`disableAdvertisingIdentifier(...)`](#disableadvertisingidentifier)
* [`disableCollectASA(...)`](#disablecollectasa)
* [`setHost(...)`](#sethost)
* [`generateInviteLink(...)`](#generateinvitelink)
* [`validateAndLogInAppPurchaseAndroid(...)`](#validateandloginapppurchaseandroid)
* [`validateAndLogInAppPurchaseIos(...)`](#validateandloginapppurchaseios)
* [`getSdkVersion()`](#getsdkversion)
* [`enableFacebookDeferredApplinks(...)`](#enablefacebookdeferredapplinks)
* [`sendPushNotificationData(...)`](#sendpushnotificationdata)
* [Interfaces](#interfaces)
* [Enums](#enums)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### addListener(...)

```typescript
addListener(eventName: AFConstants.CONVERSION_CALLBACK, listenerFunc: (event: OnConversionDataResult) => void) => PluginListenerHandle
```

| Param              | Type                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#afconstants">AFConstants.CONVERSION_CALLBACK</a></code>                       |
| **`listenerFunc`** | <code>(event: <a href="#onconversiondataresult">OnConversionDataResult</a>) =&gt; void</code> |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(...)

```typescript
addListener(eventName: AFConstants.OAOA_CALLBACK, listenerFunc: (event: OnAppOpenAttribution) => void) => PluginListenerHandle
```

| Param              | Type                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#afconstants">AFConstants.OAOA_CALLBACK</a></code>                         |
| **`listenerFunc`** | <code>(event: <a href="#onappopenattribution">OnAppOpenAttribution</a>) =&gt; void</code> |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(...)

```typescript
addListener(eventName: AFConstants.UDL_CALLBACK, listenerFunc: (event: OnDeepLink) => void) => PluginListenerHandle
```

| Param              | Type                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#afconstants">AFConstants.UDL_CALLBACK</a></code>      |
| **`listenerFunc`** | <code>(event: <a href="#ondeeplink">OnDeepLink</a>) =&gt; void</code> |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### initSDK(...)

```typescript
initSDK(options: AFInit) => any
```

| Param         | Type                                      |
| ------------- | ----------------------------------------- |
| **`options`** | <code><a href="#afinit">AFInit</a></code> |

**Returns:** <code>any</code>

--------------------


### logEvent(...)

```typescript
logEvent(date: AFEvent) => any
```

| Param      | Type                                        |
| ---------- | ------------------------------------------- |
| **`date`** | <code><a href="#afevent">AFEvent</a></code> |

**Returns:** <code>any</code>

--------------------


### setCustomerUserId(...)

```typescript
setCustomerUserId(cuid: AFCuid) => any
```

| Param      | Type                                      |
| ---------- | ----------------------------------------- |
| **`cuid`** | <code><a href="#afcuid">AFCuid</a></code> |

**Returns:** <code>any</code>

--------------------


### setCurrencyCode(...)

```typescript
setCurrencyCode(currencyCode: AFCurrency) => any
```

| Param              | Type                                              |
| ------------------ | ------------------------------------------------- |
| **`currencyCode`** | <code><a href="#afcurrency">AFCurrency</a></code> |

**Returns:** <code>any</code>

--------------------


### updateServerUninstallToken(...)

```typescript
updateServerUninstallToken(token: AFUninstall) => any
```

| Param       | Type                                                |
| ----------- | --------------------------------------------------- |
| **`token`** | <code><a href="#afuninstall">AFUninstall</a></code> |

**Returns:** <code>any</code>

--------------------


### setAppInviteOneLink(...)

```typescript
setAppInviteOneLink(id: AFOnelinkID) => any
```

| Param    | Type                                                |
| -------- | --------------------------------------------------- |
| **`id`** | <code><a href="#afonelinkid">AFOnelinkID</a></code> |

**Returns:** <code>any</code>

--------------------


### setOneLinkCustomDomain(...)

```typescript
setOneLinkCustomDomain(domains: AFOnelinkDomain) => any
```

| Param         | Type                                                        |
| ------------- | ----------------------------------------------------------- |
| **`domains`** | <code><a href="#afonelinkdomain">AFOnelinkDomain</a></code> |

**Returns:** <code>any</code>

--------------------


### appendParametersToDeepLinkingURL(...)

```typescript
appendParametersToDeepLinkingURL(data: AFAppendToDeepLink) => any
```

| Param      | Type                                                              |
| ---------- | ----------------------------------------------------------------- |
| **`data`** | <code><a href="#afappendtodeeplink">AFAppendToDeepLink</a></code> |

**Returns:** <code>any</code>

--------------------


### setResolveDeepLinkURLs(...)

```typescript
setResolveDeepLinkURLs(urls: AFUrls) => any
```

| Param      | Type                                      |
| ---------- | ----------------------------------------- |
| **`urls`** | <code><a href="#afurls">AFUrls</a></code> |

**Returns:** <code>any</code>

--------------------


### addPushNotificationDeepLinkPath(...)

```typescript
addPushNotificationDeepLinkPath(path: AFPath) => any
```

| Param      | Type                                      |
| ---------- | ----------------------------------------- |
| **`path`** | <code><a href="#afpath">AFPath</a></code> |

**Returns:** <code>any</code>

--------------------


### setSharingFilter(...)

```typescript
setSharingFilter(filters: AFFilters) => any
```

| Param         | Type                                            |
| ------------- | ----------------------------------------------- |
| **`filters`** | <code><a href="#affilters">AFFilters</a></code> |

**Returns:** <code>any</code>

--------------------


### setSharingFilterForAllPartners()

```typescript
setSharingFilterForAllPartners() => any
```

**Returns:** <code>any</code>

--------------------


### setAdditionalData(...)

```typescript
setAdditionalData(additionalData: AFData) => any
```

| Param                | Type                                      |
| -------------------- | ----------------------------------------- |
| **`additionalData`** | <code><a href="#afdata">AFData</a></code> |

**Returns:** <code>any</code>

--------------------


### getAppsFlyerUID()

```typescript
getAppsFlyerUID() => any
```

**Returns:** <code>any</code>

--------------------


### anonymizeUser(...)

```typescript
anonymizeUser(anonymize: AFAnonymizeUser) => any
```

| Param           | Type                                                        |
| --------------- | ----------------------------------------------------------- |
| **`anonymize`** | <code><a href="#afanonymizeuser">AFAnonymizeUser</a></code> |

**Returns:** <code>any</code>

--------------------


### stop(...)

```typescript
stop(stop?: AFStop | undefined) => any
```

| Param      | Type                                      |
| ---------- | ----------------------------------------- |
| **`stop`** | <code><a href="#afstop">AFStop</a></code> |

**Returns:** <code>any</code>

--------------------


### disableSKAdNetwork(...)

```typescript
disableSKAdNetwork(stop: AFDisable) => any
```

| Param      | Type                                            |
| ---------- | ----------------------------------------------- |
| **`stop`** | <code><a href="#afdisable">AFDisable</a></code> |

**Returns:** <code>any</code>

--------------------


### disableAdvertisingIdentifier(...)

```typescript
disableAdvertisingIdentifier(stop: AFDisable) => any
```

| Param      | Type                                            |
| ---------- | ----------------------------------------------- |
| **`stop`** | <code><a href="#afdisable">AFDisable</a></code> |

**Returns:** <code>any</code>

--------------------


### disableCollectASA(...)

```typescript
disableCollectASA(stop: AFDisable) => any
```

| Param      | Type                                            |
| ---------- | ----------------------------------------------- |
| **`stop`** | <code><a href="#afdisable">AFDisable</a></code> |

**Returns:** <code>any</code>

--------------------


### setHost(...)

```typescript
setHost(hostName: AFHost) => any
```

| Param          | Type                                      |
| -------------- | ----------------------------------------- |
| **`hostName`** | <code><a href="#afhost">AFHost</a></code> |

**Returns:** <code>any</code>

--------------------


### generateInviteLink(...)

```typescript
generateInviteLink(params: AFLinkGenerator) => any
```

| Param        | Type                                                        |
| ------------ | ----------------------------------------------------------- |
| **`params`** | <code><a href="#aflinkgenerator">AFLinkGenerator</a></code> |

**Returns:** <code>any</code>

--------------------


### validateAndLogInAppPurchaseAndroid(...)

```typescript
validateAndLogInAppPurchaseAndroid(purchaseData: AFAndroidInAppPurchase) => any
```

| Param              | Type                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| **`purchaseData`** | <code><a href="#afandroidinapppurchase">AFAndroidInAppPurchase</a></code> |

**Returns:** <code>any</code>

--------------------


### validateAndLogInAppPurchaseIos(...)

```typescript
validateAndLogInAppPurchaseIos(purchaseData: AFIosInAppPurchase) => any
```

| Param              | Type                                                              |
| ------------------ | ----------------------------------------------------------------- |
| **`purchaseData`** | <code><a href="#afiosinapppurchase">AFIosInAppPurchase</a></code> |

**Returns:** <code>any</code>

--------------------


### getSdkVersion()

```typescript
getSdkVersion() => any
```

**Returns:** <code>any</code>

--------------------


### enableFacebookDeferredApplinks(...)

```typescript
enableFacebookDeferredApplinks(enable: AFFbDAL) => any
```

| Param        | Type                                        |
| ------------ | ------------------------------------------- |
| **`enable`** | <code><a href="#affbdal">AFFbDAL</a></code> |

**Returns:** <code>any</code>

--------------------


### sendPushNotificationData(...)

```typescript
sendPushNotificationData(payload: AFPushPayload) => any
```

| Param         | Type                                                    |
| ------------- | ------------------------------------------------------- |
| **`payload`** | <code><a href="#afpushpayload">AFPushPayload</a></code> |

**Returns:** <code>any</code>

--------------------


### Interfaces


#### PluginListenerHandle

| Prop         | Type                      |
| ------------ | ------------------------- |
| **`remove`** | <code>() =&gt; any</code> |


#### OnConversionDataResult

| Prop               | Type                |
| ------------------ | ------------------- |
| **`callbackName`** | <code>string</code> |
| **`errorMessage`** | <code>string</code> |
| **`data`**         | <code>any</code>    |


#### OnAppOpenAttribution

| Prop               | Type                |
| ------------------ | ------------------- |
| **`callbackName`** | <code>string</code> |
| **`errorMessage`** | <code>string</code> |
| **`data`**         | <code>any</code>    |


#### OnDeepLink

| Prop           | Type                |
| -------------- | ------------------- |
| **`status`**   | <code>string</code> |
| **`error`**    | <code>string</code> |
| **`deepLink`** | <code>any</code>    |


#### AFInit

| Prop                               | Type                 |
| ---------------------------------- | -------------------- |
| **`devKey`**                       | <code>string</code>  |
| **`appID`**                        | <code>string</code>  |
| **`isDebug`**                      | <code>boolean</code> |
| **`waitForATTUserAuthorization`**  | <code>number</code>  |
| **`registerConversionListener`**   | <code>boolean</code> |
| **`registerOnAppOpenAttribution`** | <code>boolean</code> |
| **`registerOnDeepLink`**           | <code>boolean</code> |
| **`useUninstallSandbox`**          | <code>boolean</code> |
| **`useReceiptValidationSandbox`**  | <code>boolean</code> |
| **`minTimeBetweenSessions`**       | <code>number</code>  |


#### AFRes

| Prop      | Type                |
| --------- | ------------------- |
| **`res`** | <code>string</code> |


#### AFEvent

| Prop             | Type                |
| ---------------- | ------------------- |
| **`eventName`**  | <code>string</code> |
| **`eventValue`** | <code>any</code>    |


#### AFCuid

| Prop       | Type                |
| ---------- | ------------------- |
| **`cuid`** | <code>string</code> |


#### AFCurrency

| Prop               | Type                |
| ------------------ | ------------------- |
| **`currencyCode`** | <code>string</code> |


#### AFUninstall

| Prop        | Type                |
| ----------- | ------------------- |
| **`token`** | <code>string</code> |


#### AFOnelinkID

| Prop            | Type                |
| --------------- | ------------------- |
| **`onelinkID`** | <code>string</code> |


#### AFOnelinkDomain

| Prop          | Type            |
| ------------- | --------------- |
| **`domains`** | <code>{}</code> |


#### AFAppendToDeepLink

| Prop             | Type                                            |
| ---------------- | ----------------------------------------------- |
| **`contains`**   | <code>string</code>                             |
| **`parameters`** | <code><a href="#stringmap">StringMap</a></code> |


#### StringMap


#### AFUrls

| Prop       | Type            |
| ---------- | --------------- |
| **`urls`** | <code>{}</code> |


#### AFPath

| Prop       | Type            |
| ---------- | --------------- |
| **`path`** | <code>{}</code> |


#### AFFilters

| Prop          | Type            |
| ------------- | --------------- |
| **`filters`** | <code>{}</code> |


#### AFData

| Prop                 | Type             |
| -------------------- | ---------------- |
| **`additionalData`** | <code>any</code> |


#### AFUid

| Prop      | Type                |
| --------- | ------------------- |
| **`uid`** | <code>string</code> |


#### AFAnonymizeUser

| Prop                | Type                 |
| ------------------- | -------------------- |
| **`anonymizeUser`** | <code>boolean</code> |


#### AFStop

| Prop       | Type                 |
| ---------- | -------------------- |
| **`stop`** | <code>boolean</code> |


#### AFIsStopped

| Prop            | Type                 |
| --------------- | -------------------- |
| **`isStopped`** | <code>boolean</code> |


#### AFDisable

| Prop                | Type                 |
| ------------------- | -------------------- |
| **`shouldDisable`** | <code>boolean</code> |


#### AFHost

| Prop                 | Type                |
| -------------------- | ------------------- |
| **`hostPrefixName`** | <code>string</code> |
| **`hostName`**       | <code>string</code> |


#### AFLinkGenerator

| Prop                     | Type                                            |
| ------------------------ | ----------------------------------------------- |
| **`brandDomain`**        | <code>string</code>                             |
| **`campaign`**           | <code>string</code>                             |
| **`channel`**            | <code>string</code>                             |
| **`referrerName`**       | <code>string</code>                             |
| **`referrerImageURL`**   | <code>string</code>                             |
| **`referrerCustomerId`** | <code>string</code>                             |
| **`baseDeeplink`**       | <code>string</code>                             |
| **`addParameters`**      | <code><a href="#stringmap">StringMap</a></code> |


#### AFLink

| Prop       | Type                |
| ---------- | ------------------- |
| **`link`** | <code>string</code> |


#### AFAndroidInAppPurchase

| Prop               | Type                |
| ------------------ | ------------------- |
| **`publicKey`**    | <code>string</code> |
| **`signature`**    | <code>string</code> |
| **`purchaseData`** | <code>string</code> |
| **`price`**        | <code>string</code> |


#### AFIosInAppPurchase

| Prop                | Type                |
| ------------------- | ------------------- |
| **`inAppPurchase`** | <code>string</code> |
| **`price`**         | <code>string</code> |
| **`transactionId`** | <code>string</code> |


#### AFFbDAL

| Prop                    | Type                 |
| ----------------------- | -------------------- |
| **`enableFacebookDAL`** | <code>boolean</code> |


#### AFPushPayload

| Prop              | Type                                            |
| ----------------- | ----------------------------------------------- |
| **`pushPayload`** | <code><a href="#stringmap">StringMap</a></code> |


### Enums


#### AFConstants

| Members                       | Value                                  |
| ----------------------------- | -------------------------------------- |
| **`onConversionDataSuccess`** | <code>'onConversionDataSuccess'</code> |
| **`onConversionDataFail`**    | <code>'onConversionDataFail'</code>    |
| **`onAppOpenAttribution`**    | <code>'onAppOpenAttribution'</code>    |
| **`onAttributionFailure`**    | <code>'onAttributionFailure'</code>    |
| **`CONVERSION_CALLBACK`**     | <code>'conversion_callback'</code>     |
| **`OAOA_CALLBACK`**           | <code>'oaoa_callback'</code>           |
| **`UDL_CALLBACK`**            | <code>'udl_callback'</code>            |

</docgen-api>
