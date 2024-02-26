# Set Consent For DMA Compliance

Following the DMA regulations that were set by the European Commission, Google (and potentially other SRNs in the future) require to send them the user’s consent data in order to interact with them during the attribution process. In our latest plugin update (6.13.0), we've introduced two new public APIs, enhancing our support for user consent and data collection preferences in line with evolving digital market regulations. 
There are two alternative ways for gathering consent data:

- Through a Consent Management Platform (CMP): If the app uses a CMP that complies with the Transparency and Consent Framework (TCF) v2.2 protocol, the SDK can automatically retrieve the consent details.
### OR
- Through a dedicated SDK API: Developers can pass Google's required consent data directly to the SDK using a specific API designed for this purpose.

## Use CMP to collect consent data
A CMP compatible with TCF v2.2 collects DMA consent data and stores it in NSUserDefaults (iOS) and SharedPreferences (Android). To enable the SDK to access this data and include it with every event, follow these steps:
1. Call <code>AppsFlyer.enableTCFDataCollection({shouldEnableTCFDataCollection : true});</code>
2. Initialize the SDK in manual start mode by simply adding <code>manualStart: true</code> in the <code>AppsFlyer.initSDK()</code> method.
3. Use the CMP to decide if you need the consent dialog in the current session to acquire the consent data. If you need the consent dialog move to step 4, otherwise move to step 5.
4. Get confirmation from the CMP that the user has made their consent decision and the data is available in NSUserDefaults/SharedPreferences.
5. Call <code>AppsFlyer.startSDK()</code>
```typescript
    AppsFlyer.initSDK({
    appID: '1234567890', 
    devKey: 'your_dev_key', 
    isDebug: true,
    registerOnDeepLink: true,
    minTimeBetweenSessions: 6,
    registerConversionListener: true,
    registerOnAppOpenAttribution: false,
    useReceiptValidationSandbox: true,
    useUninstallSandbox: true,
    manualStart: true // <--- Manual Start
  });

  .......

  // CMP pseudocode procedure
  if (cmpManager.hasConsent()) {
        AppsFlyer.startSDK();
  } else {
        cmpManager.presentConsentDialogToUser()
            .then(res => AppsFlyer.startSDK())
}
```

## Manually collect consent data
If your app does not use a CMP compatible with TCF v2.2, use the SDK API detailed below to provide the consent data directly to the SDK, distinguishing between cases when GDPR applies or not.

### When GDPR applies to the user
If GDPR applies to the user, perform the following:

1. Given that GDPR is applicable to the user, determine whether the consent data is already stored for this session.
    1. If there is no consent data stored, show the consent dialog to capture the user consent decision.
    2. If there is consent data stored continue to the next step.
2. To transfer the consent data to the SDK create an AppsFlyerConsent object using `forGDPRUser` method that accepts the following parameters:<br>
    `hasConsentForDataUsage: boolean` - Indicates whether the user has consented to use their data for advertising purposes.<br>
    `hasConsentForAdsPersonalization: boolean` - Indicates whether the user has consented to use their data for personalized advertising.
3. Call `AppsFlyer.setConsentData(consentData)` with the AppsFlyerConsent object.
4. Call `AppsFlyer.initSdk()`.
```typescript
    // If the user is subject to GDPR - collect the consent data
    // or retrieve it from the storage
    ......
    // Set the consent data to the SDK:
    let gdprConsent = AppsFlyerConsent.forGDPRUser(true, false);

    AppsFlyer.setConsentData({data : gdprConsent});

    AppsFlyer.initSDK({
    appID: '1234567890',
    devKey: 'your_dev_key', 
    isDebug: true,
    registerOnDeepLink: true,
    minTimeBetweenSessions: 6,
    registerConversionListener: true,
    registerOnAppOpenAttribution: false,
    useReceiptValidationSandbox: true,
    useUninstallSandbox: true,
  });
  .......
```

### When GDPR does not apply to the user

If GDPR doesn’t apply to the user perform the following:
1. Create an AppsFlyerConsent object using `forNonGDPRUser` method that doesn't accepts any parameters.
2. Call `AppsFlyer.setConsentData(consentData)` with the AppsFlyerConsent object.
3. Call `AppsFlyer.initSdk()`.
```typescript
    // If the user is not subject to GDPR:
    let nonGdprUserConsentData = AppsFlyerConsent.forNonGDPRUser();

    AppsFlyer.setConsentData({data : nonGdprUserConsentData});

    AppsFlyer.initSDK({
    appID: '1234567890',
    devKey: 'your_dev_key', 
    isDebug: true,
    registerOnDeepLink: true,
    minTimeBetweenSessions: 6,
    registerConversionListener: true,
    registerOnAppOpenAttribution: false,
    useReceiptValidationSandbox: true,
    useUninstallSandbox: true,
  });
  .......
```


