# Advanced API

- [Uninstall](#uninstall)
- [User invite](#userInvite)
- [Collect IDFA with ATTrackingManager](#collect)


## <a id="uninstall"> Measure Uninstall
- [iOS uninstall](#ios-uninstall-setup)
- [Android Uninstall](#android-uninstall)

#### <a id="ios-uninstall-setup"> iOS Uninstall Setup

    
#### Option 1 - Send the token as Data to AppsFlyer natively

Code sample for AppDelegate.swift:
*Example:*

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

Read more about Uninstall register: [Appsflyer SDK support site](https://support.appsflyer.com/hc/en-us/articles/207032066-AppsFlyer-SDK-Integration-iOS)

---


###  <a id="android-uninstall"> Android Uninstall Setup
    
There are 2 main approaches of enabling uninstall measurement for Android:

1. Use [FirebaseMessagingService](https://support.appsflyer.com/hc/en-us/articles/360017822118--WIP-Integrate-Android-uninstall-measurement-into-an-app#use-fcm-with-the-appsflyer-sdk-only) from AppsFlyer SDK - only needs change to AndroidManifest <br>
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

Read more about Android  Uninstall Tracking: [Appsflyer SDK support site](https://support.appsflyer.com/hc/en-us/articles/208004986-Android-Uninstall-Tracking)





# <a id="userInvite"> User invite <br>
###  <a id="UserInviteAttribution"> User invite attribution

AppsFlyer allows you to attribute and record installs originating from user invites within your app. Allowing your existing users to invite their friends and contacts as new users to your app can be a key growth factor for your app.

Example:
  ```typescript
  AppsFlyer.generateInviteLink({
      addParameters: {code: '1256abc', page: '152'},
      campaign: 'appsflyer_plugin',
      channel: 'sms'
    })
      .then(r => alert('user invite link: ' + r.link))
      .catch(e => alert('user invite error: ' + e));
```

# <a id="collect"> Collect IDFA with ATTrackingManager
#### option 1 (Native): 

1. Add the `AppTrackingTransparency` framework to your xcode project. 
2. In the `Info.plist`:
    1. Add an entry to the list: Press +  next to `Information Property List`.
    2. Scroll down and select `Privacy - Tracking Usage Description`.
    3. Add as the value the wording you want to present to the user when asking for permission to collect the IDFA.
3. Set a value to the `waitForATTUserAuthorization` property in the initialization options     
4. In the `CAPBridgeViewController.swift` file, add: 
```swift
override func viewDidLoad() {
  super.viewDidLoad()
  
  if #available(iOS 14, *) {
    ATTrackingManager.requestTrackingAuthorization { (status) in }
  }
}
```
For more info visit our Support integration guide [Here](https://support.appsflyer.com/hc/en-us/articles/360011451918#integration) <br>

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
