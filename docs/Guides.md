
# Capacitor Appsflyer Plugin Guides

<img src="https://massets.appsflyer.com/wp-content/uploads/2016/06/26122512/banner-img-ziv.png"  width="300">

## Table of content

- [Init SDK](#init-sdk)
- [Set plugin for IOS 14](#ios14)
- [Log Event](#logevent)
- [DeepLinking](#deeplinking)
    - [Deferred Deep Linking (Get Conversion Data)](#deferred-deep-linking)
    - [Direct Deep linking](#handle-deeplinking)
    - [Unified Deep linking](#unified-deep-linking)
    - [Android Deeplink Setup](#android-deeplink)
    - [iOS Deeplink Setup](#ios-deeplink)
- [Uninstall](#uninstall)
    - [Android Uninstall Setup](#android-uninstall)
    - [iOS Uninstall Setup](#ios-uninstall)



##  <a id="init-sdk"> Init SDK
    
To initialize the AppsFlyer SDK you need to call `initSDK()`. To see a full list of the `options` check our the API doc [here](./API.md#afinit). 
    
Example:
```typescript
import {AppsFlyer ,AFInit} from 'appsflyer-capacitor-plugin';

constructor(public platform: Platform) {  
  this.platform.ready().then(() => {  
 
    const options: AFInit = {
        appID: '1234567890',  // replace with your app ID.
        devKey: 'your_dev_key',   // replace with your dev key.
        isDebug: true,
        waitForATTUserAuthorization: 10, // for iOS 14 and higher
        registerOnDeepLink: true,
        registerConversionListener: true,
      };
    AppsFlyer.initSDK(options).then(res => alert(JSON.stringify(res))).catch(e =>alert(e));  
  });  
}
```

##  <a id="ios14"> Set plugin for IOS 14
#### option 1 (Native): 
1. Add ```import AppTrackingTransparency``` in your ```AppDelegate.swift``` file<br>
2. Add the ATT pop-up for IDFA collection. your ```AppDelegate.swift``` should look like this:


```swift
   func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
           if #available(iOS 14, *){
            ATTrackingManager.requestTrackingAuthorization { (status) in
            }
        }
        return true
    }
```

3.Add ```Privacy - Tracking Usage Description``` inside your ```.plist``` file in Xcode.<br>
4.For more info visit our Support integration guide [Here](https://support.appsflyer.com/hc/en-us/articles/360011451918#integration)

#### Option 2 (3rd party plugin):
You can use this plugin:  [capacitor-plugin-app-tracking-transparency](https://www.npmjs.com/package/capacitor-plugin-app-tracking-transparency)
```typescript
 import {AppsFlyer ,AFInit} from 'appsflyer-capacitor-plugin';

constructor(public platform: Platform) {  
  this.platform.ready().then(() => {  
 ......
 ......
  AppsFlyer.initSDK(options).then(res => alert(JSON.stringify(res))).catch(e =>alert(e));  
  AppTrackingTransparency.requestPermission().then(res => alert('ATT status: ' + res.status));
  });  
}
```

  ##  <a id="logevent"> Log Event
  In-app events provide insights into how users interact with your app. AppsFlyer SDKs enable you to easily log these interactions.
  In-app events consist of 2 parts:

-   **Event name**: The unique event identifier. It is usually how marketers see the event in the dashboard.
-   **Event values**: An object that consists of key-value pairs called  **event parameters**. Event parameters provide additional context and information about the occurring event.
```typescript
  const data: AFEvent = {
      eventName: 'test',
      eventValue: { af_revenue: 956,
        af_receipt_id: 'id536',
        af_currency: 'USD'}
    };
    
    AppsFlyer.logEvent(data)
      .then(r => alert('logEvent ~~>' + r.res))
      .catch(err => alert('logEvent err ~~>' + err));
```
  
##  <a id="deeplinking"> Deep Linking
    
![alt text](https://massets.appsflyer.com/wp-content/uploads/2018/03/21101417/app-installed-Recovered.png "")


#### The 3 Deep Linking Types:
Since users may or may not have the mobile app installed, there are 2 types of deep linking:

1. Deferred Deep Linking (**Legacy APIs**) - Serving personalized content to new or former users, directly after the installation.  -
2. Direct Deep Linking (**Legacy APIs**)  - Directly serving personalized content to existing users, which already have the mobile app installed.  
3. Unified deep linking - Unified deep linking sends new and existing users to a specific in-app activity as soon as the app is opened.<br>

For more info about <ins>Deferred Deep Linking</ins> please check out the [OneLink™ Deferred deep linking Guide](https://dev.appsflyer.com/hc/docs/android-legacy-apis#deferred-deep-linking). <br>
For more info about <ins>Direct Deep linking</ins> please check out the [OneLink™ Direct Deep Linking Guide](https://dev.appsflyer.com/hc/docs/android-legacy-apis#deep-linking). <br>
For more info about <ins>Unified Deep Linking</ins> please check out the [OneLink™ Direct Deep Linking Guide](https://dev.appsflyer.com/hc/docs/unified-deep-linking-udl). <br>

### ❗️Important!
* **Deferred deep linking using the legacy method of onConversionDataSuccess may not work for iOS 14.5+, since it requires attribution data that may not be available due to privacy protection.
We recommend using unified deep linking (UDL). UDL conforms to the iOS 14.5+ privacy standards and only returns parameters relevant to deep linking and deferred deep linking: deep_link_value and deep_link_sub1. Attribution parameters (such as media_source, campaign, af_sub1-5, etc.), return null and can’t be used for deep linking purposes.**

###  <a id="deferred-deep-linking"> 1. Deferred Deep Linking (Get Conversion Data) - Legacy APIs


Check out the deferred deeplinkg guide from the AppFlyer knowledge base [here](https://support.appsflyer.com/hc/en-us/articles/207032096-Accessing-AppsFlyer-Attribution-Conversion-Data-from-the-SDK-Deferred-Deeplinking-#Introduction)

Code Sample to handle the conversion data:

```typescript
  constructor(public platform: Platform) {
    this.platform.ready().then(() => {
.....
.....
      this.setConversions();
      AppsFlyer.initSDK(options).then(res => alert(JSON.stringify(res))).catch(e =>alert(e));
    });
  }
	
  // set a listener
  setConversions() {
    AppsFlyer.addListener(AFConstants.CONVERSION_CALLBACK, event => {
      alert('CONVERSION_CALLBACK ~~>' + JSON.stringify(event));
      if (event.callbackName === AFConstants.onConversionDataSuccess){
        if(event.data.af_status === 'Non-organic' ){
          if(event.data.is_first_launch === true ){
              const deepLinkValue = event.data.deep_link_value;
              this.handleLink(deepLinkValue);
          }
        }
      }
    });
  }
```




###  <a id="handle-deeplinking"> 2. Direct Deeplinking (onAppOpenAttribution) Legacy APIs 
    
In order to implement deeplink with AppsFlyer, you must call register the listener **before** `initSDK`<br>
For more information on deeplinks, please read [here](https://dev.appsflyer.com/hc/docs/getting-started-1)




```typescript
  constructor(public platform: Platform) {
    this.platform.ready().then(() => {
.....
.....
      this.setOAOA();
      AppsFlyer.initSDK(options).then(res => alert(JSON.stringify(res))).catch(e =>alert(e));
    });
  }
  
  // set a listener
  setOAOA() {
    AppsFlyer.addListener(AFConstants.OAOA_CALLBACK, res => {
      alert('OAOA_CALLBACK ~~>' + JSON.stringify(event));
      if(res.callbackName === AFConstants.onAppOpenAttribution){
        const deepLinkValue = res.data.deep_link_value;
        this.handleLink(deepLinkValue);
      }else{
        console.log(res.errorMessage);
      }
    });
  }
```

###  <a id="unified-deep-linking"> 3. Unified deep linking
In order to use the unified deep link you need to send the `registerOnDeepLink: true` flag inside the object that sent to the sdk.<br>
**NOTE:** when sending this flag, the sdk will ignore `onAppOpenAttribution`!<br>
For more information about this api, please check [OneLink Guide Here](https://dev.appsflyer.com/docs/android-unified-deep-linking)


```typescript
  constructor(public platform: Platform) {
    this.platform.ready().then(() => {
.....
.....
      this.setUDL();
      AppsFlyer.initSDK(options).then(res => alert(JSON.stringify(res))).catch(e =>alert(e));
    });
  }
  
  // set a listener
  setUDL() {
    AppsFlyer.addListener(AFConstants.UDL_CALLBACK, res => {
      alert('UDL_CALLBACK ~~>' + JSON.stringify(res));
      if (res.status === 'FOUND') {
        const deepLinkValue = res.deepLink.deep_link_value;
        this.handleLink(deepLinkValue);
      } else if (res.status === 'ERROR') {
        console.log('udl error: ' + res.error);
      }
    });
  }
```

**Note:** The code implementation for `onDeepLink` must be made **prior to the initialization** code of the SDK.

###  <a id="android-deeplink"> Android Deeplink Setup
    
    
    
#### URI Scheme
Please follow the instructions [here](https://dev.appsflyer.com/docs/initial-setup-for-deep-linking-and-deferred-deep-linking#deciding-on-a-uri-scheme) <br>
In your app’s manifest add the following intent-filter to your relevant activity:
```xml 
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="your unique scheme" />
</intent-filter>
```


#### App Links
Please follow the instructions [here](https://dev.appsflyer.com/docs/initial-setup-for-deep-linking-and-deferred-deep-linking#generating-a-sha256-fingerprint) <br>
In your app’s manifest add the following intent-filter to your relevant activity:
```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />

    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:host="onelink-basic-app.onelink.me"
        android:pathPrefix="/H5hv"
        android:scheme="https" />
</intent-filter>
```

###  <a id="ios-deeplink"> iOS Deeplink Setup
The plugin consumes the deep link from Capacitor's notification. 
**Do not delete or override the auto-generated code in `AppDelegate.swift`**

#### <a id="ios-uri"> URI Scheme

For more on URI-schemes check out the guide [here](https://dev.appsflyer.com/docs/initial-setup-2#deciding-on-a-uri-scheme)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<array>
	<dict>
		<key>CFBundleTypeRole</key>
		<string>None</string>
		<key>CFBundleURLName</key>
		<string>YOUR_Bundle_ID</string>
		<key>CFBundleURLSchemes</key>
		<array>
			<string>scheme1</string>
			<string>scheme2</string>
		</array>
	</dict>
</array>
</plist>

```

### Universal Links
    
For more on Universal Links check out the guide [here](https://dev.appsflyer.com/hc/docs/initial-setup-2#procedures-for-ios-universal-links).
    
Essentially, the Universal Links method links between an iOS mobile app and an associate website/domain, such as AppsFlyer’s OneLink domain (xxx.onelink.me). To do so, it is required to:

1. Configure OneLink sub-domain and link to mobile app (by hosting the ‘apple-app-site-association’ file - AppsFlyer takes care of this part in the onelink setup on your dashboard)
2. Configure the mobile app to register approved domains:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
        <key>com.apple.developer.associated-domains</key>
        <array>
            <string>applinks:test.onelink.me</string>
        </array>
    </dict>
</plist>
```

##  <a id="uninstall"> Uninstall Measurement

###  <a id="android-uninstall"> Android Uninstall Setup
    
There are 2 main approaches of enabling uninstall measurement for Android:

1. Use [FirebaseMessagingService](https://support.appsflyer.com/hc/en-us/articles/360017822118--WIP-Integrate-Android-uninstall-measurement-into-an-app#use-fcm-with-the-appsflyer-sdk-only) from AppsFlyer SDK - only needs change to AndroidManifest
2. Manually pass token to SDK - should be used if you have custom logic in place when token us updated.

For more info on Android Uninstall setup check out the guide [here](https://support.appsflyer.com/hc/en-us/articles/360017822118--WIP-Integrate-Android-uninstall-measurement-into-an-app).   

#### Option 1 - AppsFlyer native service 
If the sole purpose of integrating FCM is to measure uninstalls in AppsFlyer, use  `appsFlyer.FirebaseMessagingServiceListener` service, embedded in the SDK. This extends the FirebaseFirebaseMessagingService class, used to receive the FCM Device Token.

To add `appsFlyer.FirebaseMessagingServiceListener` service to the app, place the following in your `AndroidManifest.xml` :
```xml
<application
   <!-- ... -->
      <service
        android:name="com.appsflyer.FirebaseMessagingServiceListener">
        <intent-filter>
          <action android:name="com.google.firebase.MESSAGING_EVENT"/>
        </intent-filter>
      </service>
   <!-- ... -->
</application>
```


#### Option 2 - Pass the token as a String to AppsFlyer in the ts code
Note : If you use this method you will need to collect the FCM's token using a third party platform of your choice. 

```typescript
AppsFlyer.updateServerUninstallToken({token: 'replace_with_token'});
```

###  <a id="ios-uninstall"> iOS Uninstall Setup
    
#### Option 1 - Send the token as Data to AppsFlyer natively

Code sample for AppDelegate.swift:

```swift
import UIKit
import Capacitor
import AppsFlyerLib
@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        if #available(iOS 10, *) {
            UNUserNotificationCenter.current().requestAuthorization(options:[.badge, .alert, .sound]){ (granted, error) in }
            application.registerForRemoteNotifications()
        }
        
        else if  #available(iOS 9, *) {
            UIApplication.shared.registerUserNotificationSettings(UIUserNotificationSettings(types: [.badge, .sound, .alert], categories: nil))
            UIApplication.shared.registerForRemoteNotifications()
        }
    }
    
   func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
       AppsFlyerLib.shared().registerUninstall(deviceToken)
    }
    
}
```    
    
#### Option 2 - Pass the token as a String to AppsFlyer in the ts code

Note : If you use this method you will need to collect the APNs token using a third party platform of your choice. 

```typescript
AppsFlyer.updateServerUninstallToken({token: 'replace_with_token'});
```
