# 🚀 Basic integration of the SDK

####  Set your App ID (iOS only), Dev Key and enable AppsFlyer to detect installations, sessions (app opens) and updates.  
> This is the minimum requirement to start tracking your app installs and is already implemented in this plugin. You **MUST** modify this call and provide:  
 **devKey** - Your application devKey provided by AppsFlyer.<br>
**appID**  - ***For iOS only.*** Your AppStore Application ID.<br>
**[waitForATTUserAuthorization](https://support.appsflyer.com/hc/en-us/articles/207032066-iOS-SDK-integration-guide-for-marketers#integration-31-configuring-app-tracking-transparency-att-support)**  - ***For iOS14 only.*** Time for the sdk to wait before launch.


Add the following lines to your code to be able to initialize tracking with your own AppsFlyer dev key:


```typescript
export class HomePage {
  constructor(public platform: Platform) {

    this.platform.ready().then(() => {
      const afConfig: AFInit = {
        appID: '1234567890', // replace with your app ID. 
        devKey: 'your_dev_key', // replace with your dev key. 
        isDebug: true,
        waitForATTUserAuthorization: 10, // for iOS 14 and higher
        minTimeBetweenSessions: 6, // default 5 sec
        registerOnDeepLink: true,
        registerConversionListener: true,
        registerOnAppOpenAttribution: false,
        deepLinkTimeout: 4000, // default 3000 ms
        useReceiptValidationSandbox: true, // iOS only
        useUninstallSandbox: true // iOS only
      };
     
      AppsFlyer.initSDK(afConfig).then(res => alert(JSON.stringify(res)));
    });
  }
}
```
| Setting  | Description   |
| -------- | ------------- |
| devKey   | Your application [devKey](https://support.appsflyer.com/hc/en-us/articles/207032126#integration-2-integrating-the-sdk) provided by AppsFlyer (required)  |
| appID      | Your App Store application ID  (iOS only)  |
| isDebug    | Debug mode - set to `true` for testing only  |
|registerConversionListener| Set listener for SDK init response (Optional. default=true) |
|registerOnAppOpenAttribution| Set listener for OnAppOpenAttribution response (Optional. default=true)|
|registerOnDeepLink| Set listener for UDL response (Optional. default=false) |
|waitForATTUserAuthorization| Time for the sdk to wait before launch. please read more [Here](https://support.appsflyer.com/hc/en-us/articles/207032066-iOS-SDK-V6-X-integration-guide-for-developers#integration-31-configuring-app-tracking-transparency-att-support) (iOS only) |
|useReceiptValidationSandbox| To test purchase validation using a sandboxed environment, set to `true` (Optional. default=false) |
|useUninstallSandbox| Set this flag to test uninstall on Apple environment(production or sandbox). (Optional. default=false) |
|minTimeBetweenSessions| Set a custom value for the minimum required time between sessions. (Optional. default=5 sec) |
