#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(AppsFlyerPlugin, "AppsFlyerPlugin",
           CAP_PLUGIN_METHOD(initSDK, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(logEvent, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setCustomerUserId, CAPPluginReturnNone);
           CAP_PLUGIN_METHOD(setCurrencyCode, CAPPluginReturnNone);
           CAP_PLUGIN_METHOD(updateServerUninstallToken, CAPPluginReturnNone);
           CAP_PLUGIN_METHOD(setAppInviteOneLink, CAPPluginReturnNone);
           CAP_PLUGIN_METHOD(setOneLinkCustomDomain, CAPPluginReturnNone);
           CAP_PLUGIN_METHOD(appendParametersToDeepLinkingURL, CAPPluginReturnNone);
           CAP_PLUGIN_METHOD(setResolveDeepLinkURLs, CAPPluginReturnNone);
           CAP_PLUGIN_METHOD(addPushNotificationDeepLinkPath, CAPPluginReturnNone);
           CAP_PLUGIN_METHOD(setSharingFilter, CAPPluginReturnNone);
           CAP_PLUGIN_METHOD(setSharingFilterForAllPartners, CAPPluginReturnNone);
           CAP_PLUGIN_METHOD(setAdditionalData, CAPPluginReturnNone);
           CAP_PLUGIN_METHOD(getAppsFlyerUID, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(anonymizeUser, CAPPluginReturnNone);
           CAP_PLUGIN_METHOD(stop, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(disableSKAdNetwork, CAPPluginReturnNone);
           CAP_PLUGIN_METHOD(disableAdvertisingIdentifier, CAPPluginReturnNone);
           CAP_PLUGIN_METHOD(disableCollectASA, CAPPluginReturnNone);
           CAP_PLUGIN_METHOD(setHost, CAPPluginReturnNone);
           CAP_PLUGIN_METHOD(generateInviteLink, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(validateAndLogInAppPurchaseAndroid, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(validateAndLogInAppPurchaseIos, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getSdkVersion, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(enableFacebookDeferredApplinks, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(sendPushNotificationData, CAPPluginReturnNone);
           CAP_PLUGIN_METHOD(setCurrentDeviceLanguage, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(logCrossPromoteImpression, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setUserEmails, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(logLocation, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setPhoneNumber, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setPartnerData, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(logInvite, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setSharingFilterForPartners, CAPPluginReturnPromise);


           

           
           
           





           
           
           

           


)
