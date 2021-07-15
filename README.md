<img src="https://www.appsflyer.com/wp-content/uploads/2016/11/logo-1.svg"  width="600">

# Capacitor AppsFlyer plugin for Android and iOS.

🛠 In order for us to provide optimal support, we would kindly ask you to submit any issues to support@appsflyer.com
*When submitting an issue please specify your AppsFlyer sign-up (account) email , your app ID , reproduction steps, code snippets, logs, and any additional relevant information.*

[![npm version](https://badge.fury.io/js/appsflyer-capacitor-plugin.svg)](https://badge.fury.io/js/cordova-plugin-appsflyer-sdk)
[![Build Status](https://travis-ci.org/AppsFlyerSDK/appsflyer-capacitor-plugin.svg?branch=master)](https://travis-ci.org/AppsFlyerSDK/appsflyer-cordova-plugin)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT) 
[![Downloads](https://img.shields.io/npm/dm/appsflyer-capacitor-plugin.svg)](https://www.npmjs.com/package/cordova-plugin-appsflyer-sdk)

----------

## Table of content

- [SDK versions](#plugin-build-for)
- [Installation](#installation)
- [Add or Remove Strict mode for App-kids](#appKids)
- [Guides](#guides)
- [Setup](#setup)
- [API](#api) 

## <a id="plugin-build-for"> This plugin is built for
- iOS AppsFlyerSDK **v6.3.2**
- Android AppsFlyerSDK **v6.3.2**

## <a id="installation">📲Installation
```bash  
npm install appsflyer-capacitor-plugin  
npx cap sync  
```

## <a id="appKids">👨‍👩‍👧‍👦 Add or Remove Strict mode for App-kids
The iOS SDK comes in two variants: **Strict** mode and **Regular** mode. Please read more [here](https://support.appsflyer.com/hc/en-us/articles/207032066-iOS-SDK-V6-X-integration-guide-for-developers#additional-apis-strict-mode-sdk) <br>
***Change to Strict mode***<br>
After you [installed](#installation) the AppsFlyer plugin, add `$AppsFlyerStrictMode` in the project's Podfile:
```
//App/ios/Podfile
...
use_frameworks!
  $AppsFlyerStrictMode

  # Pods for App
...

```
In the  `root` folder of your project Run `npx cap sync ios`

***Change to Regular mode***<br>
Remove `$AppsFlyerStrictMode` from the project's Podfile:
```
//App/ios/Podfile
...
use_frameworks!
 ## $AppsFlyerStrictMode // remove this line!

  # Pods for App
...
```
In the  `root` folder of your project Run `npx cap sync ios`

 ## <a id="guides"> 📖 Guides

Great installation and setup guides can be viewed [here](/docs/Guides.md).
- [init SDK Guide](/docs/Guides.md#init-sdk)
- [Deeplinking Guide](/docs/Guides.md#deeplinking)
- [Uninstall Guide](/docs/Guides.md#uninstall)
- [Set plugin for IOS 14](/docs/Guides.md#ios14)
## <a id="setup"> 🚀 Setup

####  Set your App_ID (iOS only), Dev_Key and enable AppsFlyer to detect installations, sessions (app opens) and updates.  
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

---
## <a id="api"> 📑 API
  
See the full [API](/docs/API.md) available for this plugin.
