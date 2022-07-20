# API  
  
  
<img  src="https://massets.appsflyer.com/wp-content/uploads/2018/06/20092440/static-ziv_1TP.png"  width="400"  >  
  
The list of available methods for this plugin is described below.  
  
## Table of content  
  
- [API](#api)  
- [Interfaces](#interfaces)  
- [Enums](#enums)  

    
  

## API  
  
<docgen-index>  
  
* [`addListener - Conversion Data`](#gcd)  
* [`addListener - onAppOpenAttribution`](#oaoa)  
* [`addListener - onDeepLinking`](#udl)  
* [`initSDK`](#initsdk)  
* [`logEvent`](#logevent)  
* [`setCustomerUserId`](#setcustomeruserid)  
* [`setCurrencyCode`](#setcurrencycode)  
* [`updateServerUninstallToken`](#updateserveruninstalltoken)  
* [`setAppInviteOneLink`](#setappinviteonelink)  
* [`setOneLinkCustomDomain`](#setonelinkcustomdomain)  
* [`appendParametersToDeepLinkingURL`](#appendparameterstodeeplinkingurl)  
* [`setResolveDeepLinkURLs`](#setresolvedeeplinkurls)  
* [`addPushNotificationDeepLinkPath`](#addpushnotificationdeeplinkpath)  
* [`setAdditionalData`](#setadditionaldata)  
* [`getAppsFlyerUID`](#getappsflyeruid)  
* [`anonymizeUser`](#anonymizeuser)  
* [`stop`](#stop)  
* [`disableSKAdNetwork`](#disableskadnetwork)  
* [`disableAdvertisingIdentifier`](#disableadvertisingidentifier)  
* [`disableCollectASA`](#disablecollectasa)  
* [`setHost`](#sethost)  
* [`generateInviteLink`](#generateinvitelink)  
* [`validateAndLogInAppPurchaseAndroid`](#validateandloginapppurchaseandroid)  
* [`validateAndLogInAppPurchaseIos`](#validateandloginapppurchaseios)  
* [`getSdkVersion`](#getsdkversion)  
* [`enableFacebookDeferredApplinks`](#enablefacebookdeferredapplinks)  
* [`sendPushNotificationData`](#sendpushnotificationdata)  
* [`setCurrentDeviceLanguage`](#setcurrentdevicelanguage)  
* [`logCrossPromoteImpression`](#logcrosspromoteimpression)  
* [`setUserEmails`](#setuseremails)  
* [`logLocation`](#loglocation)  
* [`setPhoneNumber`](#setphonenumber)  
* [`setPartnerData`](#setpartnerdata)  
* [`logInvite`](#loginvite)  
* [`setDisableNetworkData`](#setDisableNetworkData)
* [`setSharingFilterForPartners`](#setsharingfilterforpartners)  
* [`setSharingFilter`](#setsharingfilter)  - Deprecated
* [`setSharingFilterForAllPartners`](#setsharingfilterforallpartners)  - Deprecated
 
  
</docgen-index>  
  
<docgen-api>  
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->  
  
### <a id="gcd"> addListener  - Conversion Data
  
```typescript  
addListener(eventName: AFConstants.CONVERSION_CALLBACK, listenerFunc: (event: OnConversionDataResult) => void) => PluginListenerHandle  
```  
  
| Param              | Type                                                                                          |  
| ------------------ | --------------------------------------------------------------------------------------------- |  
| **`eventName`** | <code><a href="#afconstants">AFConstants.CONVERSION_CALLBACK</a></code>                       |  
| **`listenerFunc`** | <code>(event: <a href="#onconversiondataresult">OnConversionDataResult</a>) =&gt; void</code> |  
  
**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>  
**Example:**
```typescript
  AppsFlyer.addListener(AFConstants.CONVERSION_CALLBACK, event => {
      alert('CONVERSION_CALLBACK ~~>' + JSON.stringify(event));
      if (event.callbackName === AFConstants.onConversionDataSuccess) {
        console.log(AFConstants.onConversionDataSuccess);
      } else {
        console.log(AFConstants.onConversionDataFail);
      }
    });
```
See also Deferred Deep Linking guide [here](/Guides.md#handle-deeplinking).

--------------------  
  
  
### <a id="oaoa"> addListener  - onAppOpenAttribution
  
```typescript  
addListener(eventName: AFConstants.OAOA_CALLBACK, listenerFunc: (event: OnAppOpenAttribution) => void) => PluginListenerHandle  
```  
  
| Param              | Type                                                                                      |  
| ------------------ | ----------------------------------------------------------------------------------------- |  
| **`eventName`** | <code><a href="#afconstants">AFConstants.OAOA_CALLBACK</a></code>                         |  
| **`listenerFunc`** | <code>(event: <a href="#onappopenattribution">OnAppOpenAttribution</a>) =&gt; void</code> |  
  
**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>  
  ```typescript
 AppsFlyer.addListener(AFConstants.OAOA_CALLBACK, res => {
      alert('OAOA_CALLBACK ~~>' + JSON.stringify(res));
      if (res.callbackName === AFConstants.onAppOpenAttribution) {
        console.log(AFConstants.onAppOpenAttribution);
      } else {
        console.log(AFConstants.onAttributionFailure);
      }
    });
```
    
See also Direct Deep Linking guide [here](/Guides.md#deferred-deep-linking).


--------------------  
  
  
### <a id="udl"> addListener  - onDeepLinking
  
```typescript  
addListener(eventName: AFConstants.UDL_CALLBACK, listenerFunc: (event: OnDeepLink) => void) => PluginListenerHandle  
```  
  
| Param              | Type                                                                  |  
| ------------------ | --------------------------------------------------------------------- |  
| **`eventName`** | <code><a href="#afconstants">AFConstants.UDL_CALLBACK</a></code>      |  
| **`listenerFunc`** | <code>(event: <a href="#ondeeplink">OnDeepLink</a>) =&gt; void</code> |  
  
**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>  
  ```typescript
   AppsFlyer.addListener(AFConstants.UDL_CALLBACK, res => {
      alert('UDL_CALLBACK ~~>' + JSON.stringify(res));
      if (res.status === 'FOUND') {
        console.log('deep link found');
      } else if (res.status === 'ERROR') {
        console.log('deep link error');
      }else{
        console.log('deep link not found');
      }
    });
```
See also Unified Deeplinking guide [here](/Guides.md#unified-deep-linking).


--------------------  
  
  
### initSDK  
  
```typescript  
initSDK(options: AFInit) => Promise<AFRes>  
```  
  
Use this method to initialize and start AppsFlyer SDK. This API should be called as soon as the app launched.  
  
| Param         | Type                                      |  
| ------------- | ----------------------------------------- |  
| **`options`** | <code><a href="#afinit">AFInit</a></code> |  
  
**Returns:** <code>Promise<<a href="#aFRes">AFRes</a>></code>  
  ```typescript
      const options: AFInit = {
        appID: '1234567890',  // replace with your app ID.
        devKey: 'your_dev_key',   // replace with your dev key.
        isDebug: true,
        waitForATTUserAuthorization: 10, // for iOS 14 and higher
        registerOnDeepLink: true,
        registerConversionListener: true,
      };
    AppsFlyer.initSDK(options)
	    .then(res => alert(JSON.stringify(res)))
	    .catch(e =>alert(e));  
```
See also Init SDK guide [here](/Guides.md#init-sdk).


--------------------  
  
  
### logEvent  
  
```typescript  
logEvent(data: AFEvent) => Promise<AFRes>  
```  
  
Log an in-app event.  
  
| Param      | Type                                        |  
| ---------- | ------------------------------------------- |  
| **`data`** | <code><a href="#afevent">AFEvent</a></code> |  
  
**Returns:** <code>Promise<<a href="#afres">AFRes</a>></code>  
  ```typescript
      const data: AFEvent = {
      eventName: 'test',
      eventValue: {
        af_revenue: 956,
        af_receipt_id: 'id536',
        af_currency: 'USD'
      }
    };
    AppsFlyer.logEvent(data)
      .then(r => alert('logEvent ~~>' + r.res))
      .catch(err => alert('logEvent err ~~>' + err));
```
See also Log Event guide [here](/Guides.md#logevent).


--------------------  
  
  
### setCustomerUserId  
  
```typescript  
setCustomerUserId(cuid: AFCuid) => Promise<void>  
```  
  
Setting your own customer ID enables you to cross-reference your own unique ID with AppsFlyer’s unique ID and other devices’ IDs.  
This ID is available in raw-data reports and in the Postback APIs for cross-referencing with your internal IDs.  
  
| Param      | Type                                      |  
| ---------- | ----------------------------------------- |  
| **`cuid`** | <code><a href="#afcuid">AFCuid</a></code> |  
  
**Returns:** <code>Promise<void></code>  
  ```typescript
      AppsFlyer.setCustomerUserId({cuid: 'your_cuid_here'});
```
--------------------  
  
  
### setCurrencyCode  
  
```typescript  
setCurrencyCode(currencyCode: AFCurrency) => Promise<void>  
```  
  
Sets the currency for in-app purchases. The currency code should be a 3 character ISO 4217 code  
  
| Param              | Type                                              |  
| ------------------ | ------------------------------------------------- |  
| **`currencyCode`** | <code><a href="#afcurrency">AFCurrency</a></code> |  
  
**Returns:** <code>Promise<void></code>  
  ```typescript
AppsFlyer.setCurrencyCode({currencyCode: 'ILS'});
```
--------------------  
  
  
### updateServerUninstallToken  

```typescript  
updateServerUninstallToken(token: AFUninstall) => Promise<void>  
```  
  
(Android) Allows to pass GCM/FCM Tokens that where collected by third party plugins to the AppsFlyer server. Can be used for Uninstall log.  
(iOS) Allows to pass APN Tokens that where collected by third party plugins to the AppsFlyer server. Can be used for log Uninstall.  
  
| Param       | Type                                                |  
| ----------- | --------------------------------------------------- |  
| **`token`** | <code><a href="#afuninstall">AFUninstall</a></code> |  
  
**Returns:** <code>Promise<void></code>  
  ```typescript
  AppsFlyer.updateServerUninstallToken({token: 'replace_with_token'});
```
See also Uninstall guide [here](/Guides.md#uninstall).


--------------------  
  
  
### setAppInviteOneLink  
  
```typescript  
setAppInviteOneLink(id: AFOnelinkID) => Promise<void>  
```  
  
Set the OneLink ID that should be used for attributing user-Invite. The link that is generated for the user invite will use this OneLink as the base link.  
  
| Param    | Type                                                |  
| -------- | --------------------------------------------------- |  
| **`id`** | <code><a href="#afonelinkid">AFOnelinkID</a></code> |  
  
**Returns:** <code>Promise<void></code>  
  ```typescript
AppsFlyer.setAppInviteOneLink({onelinkID: 'ymod'});
```
--------------------  
  
  
### setOneLinkCustomDomain  
  
```typescript  
setOneLinkCustomDomain(domains: AFOnelinkDomain) => Promise<void>  
```  
  
In order for AppsFlyer SDK to successfully resolve hidden (decoded in shortlink ID) attribution parameters, any domain that is configured as a branded domain in the AppsFlyer Dashboard should be provided to this method.  
  
| Param         | Type                                                        |  
| ------------- | ----------------------------------------------------------- |  
| **`domains`** | <code><a href="#afonelinkdomain">AFOnelinkDomain</a></code> |  
  
**Returns:** <code>Promise<void></code>  
  ```typescript
AppsFlyer.setOneLinkCustomDomain({domains:
 ['promotion.greatapp.com', 'click.greatapp.com', 'deals.greatapp.com']});
```
--------------------  
  
  
### appendParametersToDeepLinkingURL  
  
```typescript  
appendParametersToDeepLinkingURL(data: AFAppendToDeepLink) => Promise<void>  
```  
  
Enables app owners using App Links for deep linking (without OneLink) to attribute sessions initiated via a domain associated with their app. Call this method before calling start.  
You must provide the following parameters in the parameters Map:  
pid  
is_retargeting must be set to true  
  
| Param      | Type                                                              |  
| ---------- | ----------------------------------------------------------------- |  
| **`data`** | <code><a href="#afappendtodeeplink">AFAppendToDeepLink</a></code> |  
  
**Returns:** <code>Promise<void></code>   
  ```typescript
 AppsFlyer.appendParametersToDeepLinkingURL({
      contains: 'appsflyer',
      parameters: {
        is_retargeting: 'true', //Required
        pid: 'af_plugin', //Required
        my_param: 'xyz'
      }
    });
```
--------------------  
  
  
### setResolveDeepLinkURLs  
  
```typescript  
setResolveDeepLinkURLs(urls: AFUrls) => Promise<void>  
```  
  
Advertisers can wrap an AppsFlyer OneLink within another Universal Link. This Universal Link will invoke the app but any deep linking data will not propagate to AppsFlyer.  
 setResolveDeepLinkURLs enables you to configure the SDK to resolve the wrapped OneLink URLs, so that deep linking can occur correctly.  
  
| Param      | Type                                      |  
| ---------- | ----------------------------------------- |  
| **`urls`** | <code><a href="#afurls">AFUrls</a></code> |  
  
**Returns:** <code>Promise<void></code>   
  ```typescript
    AppsFlyer.setResolveDeepLinkURLs({urls: ['af', 'appsflyer']});
```
--------------------  
  
  
### addPushNotificationDeepLinkPath  
  
```typescript  
addPushNotificationDeepLinkPath(path: AFPath) => Promise<void>  
```  
  
Configures how the SDK extracts deep link values from push notification payloads.  
  
| Param      | Type                                      |  
| ---------- | ----------------------------------------- |  
| **`path`** | <code><a href="#afpath">AFPath</a></code> |  
  
**Returns:** <code>Promise<void></code>  
  ```typescript
    AppsFlyer.addPushNotificationDeepLinkPath({path: ['appsflyer', 'capacitor', 'plugin']});
```
More info can be found [here](https://support.appsflyer.com/hc/en-us/articles/207364076-Measuring-push-notification-re-engagement-campaigns#configure-push-notification-deep-link-resolution).



--------------------  
  
### <a id="setsharingfilterforpartners"> setSharingFilterForPartners 

```typescript  
setSharingFilterForPartners(filters: AFFilters) => Promise<void>  
```  
  
Stops events from propagating to the specified AppsFlyer partners.  
  
| Param         | Type                                            |  
| ------------- | ----------------------------------------------- |  
| **`filters`** | <code><a href="#affilters">AFFilters</a></code> |  
  
**Returns:** <code>Promise<void></code>  
  ```typescript
AppsFlyer.setSharingFilterForPartners({filters: ['google_int']}); // set filter for spesific partners
AppsFlyer.setSharingFilterForPartners({filters: ['all']}); // set filters for spesific partners
AppsFlyer.setSharingFilterForPartners({filters: ['None']}); // remove all filters
```
--------------------    
  
### <a id="setsharingfilter"> setSharingFilter - Deprecated

```typescript  
setSharingFilter(filters: AFFilters) => Promise<void>  
```  
  
Stops events from propagating to the specified AppsFlyer partners.  
  
| Param         | Type                                            |  
| ------------- | ----------------------------------------------- |  
| **`filters`** | <code><a href="#affilters">AFFilters</a></code> |  
  
**Returns:** <code>Promise<void></code>  
  ```typescript
AppsFlyer.setSharingFilter({filters: ['google_int']});
```
--------------------  
  
  
### <a id="setsharingfilterforallpartners"> setSharingFilterForAllPartners - Deprecated
  
```typescript  
setSharingFilterForAllPartners() => Promise<void>  
```  
  
Stops events from propagating to all AppsFlyer partners. Overwrites setSharingFilter.  
  
**Returns:** <code>Promise<void></code>  
  ```typescript
    AppsFlyer.setSharingFilterForAllPartners();
```
--------------------  
  
  
### setAdditionalData  
  
```typescript  
setAdditionalData(additionalData: AFData) => Promise<void>  
```  
  
Set additional data to be sent to AppsFlyer. See  
  
| Param                | Type                                      |  
| -------------------- | ----------------------------------------- |  
| **`additionalData`** | <code><a href="#afdata">AFData</a></code> |  
  
**Returns:** <code>Promise<void></code>  
  ```typescript
AppsFlyer.setAdditionalData({
      additionalData: {
        capacitor: 'plugin',
        apps: 'Flyer'
      }
    });
```
--------------------  
  
  
### getAppsFlyerUID
  
```typescript  
getAppsFlyerUID() => Promise<void>  
```  
  
Get AppsFlyer's unique device ID (created for every new install of an app).  
  
**Returns:** <code>Promise<void></code>  
  ```typescript
AppsFlyer.getAppsFlyerUID()
      .then(res => alert('AppsFlyer ID:' + res.uid));
```
--------------------  
  
  
### anonymizeUser  
  
```typescript  
anonymizeUser(anonymize: AFAnonymizeUser) => Promise<void>  
```  
  
End User Opt-Out from AppsFlyer analytics (Anonymize user data).  
  
| Param           | Type                                                        |  
| --------------- | ----------------------------------------------------------- |  
| **`anonymize`** | <code><a href="#afanonymizeuser">AFAnonymizeUser</a></code> |  
  
**Returns:** <code>Promise<void></code>   
  ```typescript
AppsFlyer.anonymizeUser({anonymizeUser: true});
```
--------------------  
  
  
### stop  
  
```typescript  
stop(stop?: AFStop | undefined) => Promise<void>  
```  
  
Once this API is invoked, our SDK no longer communicates with our servers and stops functioning.  
Useful when implementing user opt-in/opt-out.  
  
| Param      | Type                                      |  
| ---------- | ----------------------------------------- |  
| **`stop`** | <code><a href="#afstop">AFStop</a></code> |  
  
**Returns:** <code>Promise<void></code>  
  ```typescript
AppsFlyer.stop({stop: true}) //change state
          .then(r => alert('isStopped: ' + r.isStopped)); //show state after change
```
--------------------  
  
  
### disableSKAdNetwork  
 * iOS only 
```typescript  
disableSKAdNetwork(stop: AFDisable) => Promise<void>  
```  
  
Opt-out of SKAdNetwork  
  
| Param      | Type                                            |  
| ---------- | ----------------------------------------------- |  
| **`stop`** | <code><a href="#afdisable">AFDisable</a></code> |  
  
**Returns:** <code>Promise<void></code>  
  ```typescript
AppsFlyer.disableSKAdNetwork({shouldDisable:true});
```
--------------------  
  
  
### disableAdvertisingIdentifier  
  
```typescript  
disableAdvertisingIdentifier(stop: AFDisable) => Promise<void>  
```  
  
Disables collection of various Advertising IDs by the SDK. This includes Apple Identity for Advertisers (IDFA), Google Advertising ID (GAID), OAID and Amazon Advertising ID (AAID).  
  
| Param      | Type                                            |  
| ---------- | ----------------------------------------------- |  
| **`stop`** | <code><a href="#afdisable">AFDisable</a></code> |  
  
**Returns:** <code>Promise<void></code>  
  ```typescript
AppsFlyer.disableAdvertisingIdentifier({shouldDisable:true});
```
--------------------  
  
### setDisableNetworkData  
  
```typescript  
setDisableNetworkData(disable: AFDisable) => Promise<void>  
```  
  
Use to opt-out of collecting the network operator name (carrier) and sim operator name from the device. (Android Only)  
| Param      | Type                                            |  
| ---------- | ----------------------------------------------- |  
| **`disable`** | <code><a href="#afdisable">AFDisable</a></code> |  
  
**Returns:** <code>Promise<void></code>  
  ```typescript
AppsFlyer.setDisableNetworkData({shouldDisable:true});
```
--------------------  
  
  
### disableCollectASA  
   * iOS only 
```typescript  
disableCollectASA(stop: AFDisable) => Promise<void>  
```  
  
Opt-out of Apple Search Ads attributions.  
  
| Param      | Type                                            |  
| ---------- | ----------------------------------------------- |  
| **`stop`** | <code><a href="#afdisable">AFDisable</a></code> |  
  
**Returns:** <code>Promise<void></code>  
  ```typescript
AppsFlyer.disableCollectASA({shouldDisable:true});
```
--------------------  
  
  
### setHost  
  
```typescript  
setHost(hostName: AFHost) => Promise<void>  
```  
  
Set a custom host.  
  
| Param          | Type                                      |  
| -------------- | ----------------------------------------- |  
| **`hostName`** | <code><a href="#afhost">AFHost</a></code> |  
  
**Returns:** <code>Promise<void></code>   
  ```typescript
AppsFlyer.setHost({hostName:'ce',hostPrefixName:'af'});
```
--------------------  
  
  
### generateInviteLink  
  
```typescript  
generateInviteLink(params: AFLinkGenerator) => Promise<void>  
```  
  
Allowing your existing users to invite their friends and contacts as new users to your app  
  
| Param        | Type                                                        |  
| ------------ | ----------------------------------------------------------- |  
| **`params`** | <code><a href="#aflinkgenerator">AFLinkGenerator</a></code> |  
  
**Returns:** <code>Promise<void></code>  
  ```typescript
  AppsFlyer.generateInviteLink({
      addParameters: {code: '1256abc', page: '152'},
      campaign: 'appsflyer_plugin',
      channel: 'sms'
    })
      .then(r => alert('user invite link: ' + r.link))
      .catch(e => alert('user invite error: ' + e));
```
--------------------  
  
  
### validateAndLogInAppPurchaseAndroid  
   * Android only 
```typescript  
validateAndLogInAppPurchaseAndroid(purchaseData: AFAndroidInAppPurchase) => Promise<void>  
```  
  
API for server verification of in-app purchases. An af_purchase event with the relevant values will be automatically logged if the validation is successful.  
  
| Param              | Type                                                                      |  
| ------------------ | ------------------------------------------------------------------------- |  
| **`purchaseData`** | <code><a href="#afandroidinapppurchase">AFAndroidInAppPurchase</a></code> |  
  
**Returns:** <code>Promise<<a href="#afres">AFRes</a>></code>  
  ```typescript
	AppsFlyer.validateAndLogInAppPurchaseAndroid({
        additionalParameters: {aa: 'cc'},
        currency: 'usd',
        price: '20',
        signature: 'the_signature',
        publicKey: 'your_public_key',
        purchaseData: 'the_purchase_data'
      })
        .then(r => alert('validateAndLogInAppPurchase success: ' + r.res))
        .catch(e => alert('validateAndLogInAppPurchase error: ' + e));
```
--------------------  
  
  
### validateAndLogInAppPurchaseIos  
   * iOS only 
```typescript  
validateAndLogInAppPurchaseIos(purchaseData: AFIosInAppPurchase) => Promise<void>  
```  
  
| Param              | Type                                                              |  
| ------------------ | ----------------------------------------------------------------- |  
| **`purchaseData`** | <code><a href="#afiosinapppurchase">AFIosInAppPurchase</a></code> |  
  
**Returns:** <code>Promise<<a href="#afres">AFRes</a>></code>  
  ```typescript
     AppsFlyer.validateAndLogInAppPurchaseIos({
        additionalParameters: {aa: 'cc'},
        currency: 'usd',
        price: '20',
        inAppPurchase: 'productIdentifier',
        transactionId: 'transactionId'
      })
        .then(r => alert('validateAndLogInAppPurchase success: ' + r.res))
        .catch(e => alert('validateAndLogInAppPurchase error: ' + JSON.stringify(e)));
```
--------------------  
  
  
### getSdkVersion
  
```typescript  
getSdkVersion() => Promise<void>  
```  
  
Get the AppsFlyer SDK version used in app.  
  
**Returns:** <code>Promise<<a href="#afres">AFRes</a>></code>  
  ```typescript
AppsFlyer.getSdkVersion()
      .then(v => alert('SDK Version: ' + v.res));
```
--------------------  
  
  
### enableFacebookDeferredApplinks  
  
```typescript  
enableFacebookDeferredApplinks(enable: AFFbDAL) => Promise<void>  
```  
  
Enable the collection of Facebook Deferred AppLinks. Requires Facebook SDK and Facebook app on target/client device.  
This API must be invoked before initializing the AppsFlyer SDK in order to function properly.  
  
| Param        | Type                                        |  
| ------------ | ------------------------------------------- |  
| **`enable`** | <code><a href="#affbdal">AFFbDAL</a></code> |  
  
**Returns:** <code>Promise<<a href="#afres">AFRes</a>></code>  
  ```typescript
AppsFlyer.enableFacebookDeferredApplinks({enableFacebookDAL: true})
      .then(res => alert(res.res))
      .catch(e => alert(e));
```
--------------------  
  
  
### sendPushNotificationData  
  
```typescript  
sendPushNotificationData(payload: AFPushPayload) => Promise<void>  
```  
  
Measure and get data from push-notification campaigns.  
  
| Param         | Type                                                    |  
| ------------- | ------------------------------------------------------- |  
| **`payload`** | <code><a href="#afpushpayload">AFPushPayload</a></code> |  
  
**Returns:** <code>Promise<void></code>   
  ```typescript
 AppsFlyer.sendPushNotificationData({
      pushPayload: {af: '{"pid":"media_int","is_retargeting":"true", "c":"test_campaign"}'} //replace with push payload
    });
```
--------------------  
  
### setCurrentDeviceLanguage
```typescript  
setCurrentDeviceLanguage(language: AFLanguage): Promise<AFRes>;
```  

Set the language of the device. The data will be displayed in Raw Data Reports  

| Param         | Type                                                    |  
| ------------- | ------------------------------------------------------- |  
| **`language`** | <code><a href="#aflanguage">AFLanguage</a></code> |  
  
**Returns:** <code>Promise<void></code> 

```typescript  
    AppsFlyer.setCurrentDeviceLanguage({language: 'en'})
      .then(res => console.log(res.res))
      .catch(e => console.log(e));
```  

--------------------  
  
### logCrossPromoteImpression
```typescript  
    logCrossPromoteImpression(data: AFPromotion): Promise<AFRes>;
```  

logs an impression as part of a cross-promotion campaign. Make sure to use the promoted App ID as it appears within the AppsFlyer dashboard.

| Param         | Type                                                    |  
| ------------- | ------------------------------------------------------- |  
| **`data`** | <code><a href="#afpromotion">AFPromotion</a></code> |  
  
**Returns:** <code>Promise<void></code> 

```typescript  
   if (isPlatform('ios')) {
          AppsFlyer.logCrossPromoteImpression({
              appID: 'id1192323960',
              campaign: 'test',
              parameters: {pid: 'capacitorTest', deep_link_value: 'af'}
          });
      } else {
          AppsFlyer.logCrossPromoteImpression({
              appID: 'com.appsflyer.android.deviceid',
              campaign: 'test',
              parameters: {pid: 'capacitorTest', deep_link_value: 'af'}
          });
      }
```  

--------------------  

### setUserEmails
```typescript  
setUserEmails(emails: AFEmails): Promise<AFRes>;
```  

Set the user emails and encrypt them.

| Param         | Type                                                    |  
| ------------- | ------------------------------------------------------- |  
| **`emails`** | <code><a href="#afemails">AFEmails</a></code> |  
  
**Returns:** <code>Promise<<a href="#aFRes">AFRes</a>></code>  

```typescript  
    AppsFlyer.setUserEmails({emails: ['abc@appsflyer.com', 'af@af.com'], encode: true})
      .then(res => console.log(res.res))
      .catch(e => console.log(e));
```  


--------------------  

### logLocation
```typescript  
logLocation(latLng : AFLatLng): Promise<AFRes>;
```  

Manually log the location of the user

| Param         | Type                                                    |  
| ------------- | ------------------------------------------------------- |  
| **`latLng`** | <code><a href="#aflatLng">AFLatLng</a></code> |  
  
**Returns:** <code>Promise<<a href="#aFRes">AFRes</a>></code>  

```typescript  
    AppsFlyer.logLocation({latitude: -32.25562, longitude: 32.545414})
      .then(res => console.log(res.res))
      .catch(e => console.log(e));
```  
--------------------  

### setPhoneNumber
```typescript  
setPhoneNumber(phone : AFPhone): Promise<AFRes>;
```  

Will be sent as an SHA-256 encrypted string.

| Param         | Type                                                    |  
| ------------- | ------------------------------------------------------- |  
| **`phone`** | <code><a href="#afphone">AFPhone</a></code> |  
  
**Returns:** <code>Promise<<a href="#aFRes">AFRes</a>></code>  

```typescript  
    AppsFlyer.setPhoneNumber({phone: '0123456789'})
      .then(res => console.log(res.res))
      .catch(e => console.log(e));
```  
--------------------  

### setPartnerData
```typescript  
setPartnerData(data : AFPartnerData): Promise<AFRes>;
```  

Allows sending custom data for partner integration purposes.

| Param         | Type                                                    |  
| ------------- | ------------------------------------------------------- |  
| **`data`** | <code><a href="#afpartnerdata">AFPartnerData</a></code> |  
  
**Returns:** <code>Promise<<a href="#aFRes">AFRes</a>></code>  

```typescript  
    AppsFlyer.setPartnerData({
        data: {
            apps: 'flyer',
            af: 'IL'
        },
        partnerId: 'af_int'
    }).then(res => console.log(res.res))
      .catch(e => console.log(e));
```  

--------------------  

### logInvite
```typescript  
logInvite(data : AFLogInvite): Promise<AFRes>;
```  

Use to log a user-invite in-app event (af_invite).

| Param         | Type                                                    |  
| ------------- | ------------------------------------------------------- |  
| **`data`** | <code><a href="#afloginvite">AFLogInvite</a></code> |  
  
**Returns:** <code>Promise<<a href="#aFRes">AFRes</a>></code>  

```typescript  
     AppsFlyer.logInvite({channel: 'email', eventParameters: {abc: 'xyz', apps: 'Flyer'}})
      .then(res => console.log(res.res))
      .catch(e => console.log(e));
``` 

## Interfaces  
  
  
#### PluginListenerHandle  
  
| Prop         | Type                      |  
| ------------ | ------------------------- |  
| **`remove`** | <code>() =&gt; any</code> |  
  
  
#### OnConversionDataResult  
  
| Prop               | Type                |  
| ------------------ | ------------------- |  
| **`callbackName`** | <code>string</code> |  
| **`errorMessage`** | <code>string</code> |  
| **`data`** | <code>any</code>    |  
  
  
#### OnAppOpenAttribution  
  
| Prop               | Type                |  
| ------------------ | ------------------- |  
| **`callbackName`** | <code>string</code> |  
| **`errorMessage`** | <code>string</code> |  
| **`data`** | <code>any</code>    |  
  
  
#### OnDeepLink  
  
| Prop           | Type                |  
| -------------- | ------------------- |  
| **`status`** | <code>string</code> |  
| **`error`** | <code>string</code> |  
| **`deepLink`** | <code>any</code>    |  
  
  
#### AFInit  
  
| Prop                               | Type                 |  
| ---------------------------------- | -------------------- |  
| **`devKey`** | <code>string</code>  |  
| **`appID`** | <code>string</code>  |  
| **`isDebug`** | <code>boolean</code> |  
| **`waitForATTUserAuthorization`** | <code>number</code>  |  
| **`registerConversionListener`** | <code>boolean</code> |  
| **`registerOnAppOpenAttribution`** | <code>boolean</code> |  
| **`registerOnDeepLink`** | <code>boolean</code> |  
| **`useUninstallSandbox`** | <code>boolean</code> |  
| **`useReceiptValidationSandbox`** | <code>boolean</code> |  
| **`minTimeBetweenSessions`** | <code>number</code>  |  
| **`deepLinkTimeout`** | <code>number</code>  |  
  
  
#### AFRes  
  
| Prop      | Type                |  
| --------- | ------------------- |  
| **`res`** | <code>string</code> |  

#### AFLanguage  
  
| Prop      | Type                |  
| --------- | ------------------- |  
| **`language`** | <code>string</code> |    

#### AFPhone  
  
| Prop      | Type                |  
| --------- | ------------------- |  
| **`phone`** | <code>string</code> |    
  
#### AFEvent  
  
| Prop             | Type                |  
| ---------------- | ------------------- |  
| **`eventName`** | <code>string</code> |  
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
| **`contains`** | <code>string</code>                             |  
| **`parameters`** | <code><a href="#stringmap">StringMap</a></code> |  
  
  
#### StringMap  
  
#### AFEmails  
  
| Prop       | Type            |  
| ---------- | --------------- |  
| **`emails`** | <code>string[]</code> |  
| **`encode`** | <code>boolean</code> | 
 
 #### AFLatLng  
  
| Prop       | Type            |  
| ---------- | --------------- |  
| **`latitude`** | <code>number</code> |  
| **`longitude`** | <code>number</code> |  
  
#### AFUrls  
  
| Prop       | Type            |  
| ---------- | --------------- |  
| **`urls`** | <code>string[]</code> |  
  
  
#### AFPath  
  
| Prop       | Type            |  
| ---------- | --------------- |  
| **`path`** | <code>string[]</code> |  
  
  
#### AFFilters  
  
| Prop          | Type            |  
| ------------- | --------------- |  
| **`filters`** | <code>string[]</code> |  
  
  
#### AFPartnerData  
  
| Prop                 | Type             |  
| -------------------- | ---------------- |  
| **`data`** | <code>any</code> |  
| **`partnerId`** | <code>string</code> |  

  
  
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
| **`hostName`** | <code>string</code> |  
  
#### AFPromotion  
  
| Prop                 | Type                |  
| -------------------- | ------------------- |  
| **`appID`** | <code>string</code> |  
| **`campaign`** | <code>string</code> |  
| **`parameters`** |  <code><a href="#stringmap">StringMap</a></code>  |  
  
#### AFLinkGenerator  
  
| Prop                     | Type                                            |  
| ------------------------ | ----------------------------------------------- |  
| **`brandDomain`** | <code>string</code>                             |  
| **`campaign`** | <code>string</code>                             |  
| **`channel`** | <code>string</code>                             |  
| **`referrerName`** | <code>string</code>                             |  
| **`referrerImageURL`** | <code>string</code>                             |  
| **`referrerCustomerId`** | <code>string</code>                             |  
| **`baseDeeplink`** | <code>string</code>                             |  
| **`addParameters`** | <code><a href="#stringmap">StringMap</a></code> |  
  
  
#### AFLink  
  
| Prop       | Type                |  
| ---------- | ------------------- |  
| **`link`** | <code>string</code> |  
  
  
#### AFAndroidInAppPurchase  
  
| Prop               | Type                |  
| ------------------ | ------------------- |  
| **`publicKey`** | <code>string</code> |  
| **`signature`** | <code>string</code> |  
| **`purchaseData`** | <code>string</code> |  
| **`price`** | <code>string</code> |  
  
  
#### AFIosInAppPurchase  
  
| Prop                | Type                |  
| ------------------- | ------------------- |  
| **`inAppPurchase`** | <code>string</code> |  
| **`price`** | <code>string</code> |  
| **`transactionId`** | <code>string</code> |  
  
  
#### AFFbDAL  
  
| Prop                    | Type                 |  
| ----------------------- | -------------------- |  
| **`enableFacebookDAL`** | <code>boolean</code> |  
  
  
#### AFPushPayload  
  
| Prop              | Type                                            |  
| ----------------- | ----------------------------------------------- |  
| **`pushPayload`** | <code><a href="#stringmap">StringMap</a></code> |  
  
#### AFLogInvite  
  
| Prop              | Type                                            |  
| ----------------- | ----------------------------------------------- |  
| **`eventParameters`** | <code><a href="#stringmap">StringMap</a></code> |  
| **`channel`** |  <code>string</code>|  
  
## Enums  
  
  
#### AFConstants  
  
| Members                       | Value                                  |  
| ----------------------------- | -------------------------------------- |  
| **`onConversionDataSuccess`** | <code>'onConversionDataSuccess'</code> |  
| **`onConversionDataFail`** | <code>'onConversionDataFail'</code>    |  
| **`onAppOpenAttribution`** | <code>'onAppOpenAttribution'</code>    |  
| **`onAttributionFailure`** | <code>'onAttributionFailure'</code>    |  
| **`CONVERSION_CALLBACK`** | <code>'conversion_callback'</code>     |  
| **`OAOA_CALLBACK`** | <code>'oaoa_callback'</code>           |  
| **`UDL_CALLBACK`** | <code>'udl_callback'</code>            |  
  
</docgen-api>
