# Adding appsflyer-capacitor-plugin to your project

## 📲 Adding the SDK to your project

The plugin available via npm. To install the plugin, please run the following commands in your project root directory.
 ```bash  
 npm install appsflyer-capacitor-plugin  
 npx cap sync  
 ```

## <a id="cap6"> Capacitor 6 - Latest Version
The latest version that supports Capacitor 6 uses the following SDK versions:
- Android AppsFlyer SDK **6.16.2**
- iOS AppsFlyer SDK **6.16.2**

The plugin available via npm under the tag `latest-6`. To install the plugin, please run the following commands in your project root directory.

 ```bash  
 npm install appsflyer-capacitor-plugin@latest-6
 npx cap sync  
 ```

## <a id="cap5"> Capacitor 5 - Latest Version
The latest version that supports Capacitor 5 uses the following SDK versions:
- Android AppsFlyer SDK **6.14.0**
- iOS AppsFlyer SDK **6.14.3**

The plugin available via npm under the tag `latest-5`. To install the plugin, please run the following commands in your project root directory.

 ```bash  
 npm install appsflyer-capacitor-plugin@latest-5
 npx cap sync  
 ```

## <a id="cap4"> Capacitor 4 - Latest Version
The latest version that supports Capacitor 4 uses the following SDK versions:
- Android AppsFlyer SDK **6.10.3**
- iOS AppsFlyer SDK **6.10.1**

The plugin available via npm under the tag `latest-4`. To install the plugin, please run the following commands in your project root directory.

 ```bash  
 npm install appsflyer-capacitor-plugin@latest-4
 npx cap sync  
 ```


## <a id="cap3"> Capacitor 3 - Latest Version
The latest version that supports Capacitor 3 uses the following SDK versions: 
- Android AppsFlyer SDK **6.9.2**
- iOS AppsFlyer SDK **6.8.1**

The plugin available via npm under the tag `latest-3`. To install the plugin, please run the following commands in your project root directory.

 ```bash  
 npm install appsflyer-capacitor-plugin@latest-3
 npx cap sync  
 ```

## ⚠️ Adding AD_ID permission for Android ⚠️
In v6.8.0 of the AppsFlyer SDK, we added the normal permission `com.google.android.gms.permission.AD_ID` to the SDK's AndroidManifest, 
to allow the SDK to collect the Android Advertising ID on apps targeting API 33.
If your app is targeting children, you need to revoke this permission to comply with Google's Data policy.
You can read more about it [here](https://dev.appsflyer.com/hc/docs/install-android-sdk#the-ad_id-permission).
