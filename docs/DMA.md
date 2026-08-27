# Set Consent For DMA Compliance

Following the DMA regulations that were set by the European Commission, Google (and potentially other SRNs in the future) require to send them the user's consent data in order to interact with them during the attribution process. This plugin exposes two public APIs for it, `enableTCFDataCollection` and `setConsentData`, covering user consent and data collection preferences in line with evolving digital market regulations.
There are two alternative ways for gathering consent data:

- Through a Consent Management Platform (CMP): If the app uses a CMP that complies with the Transparency and Consent Framework (TCF) v2.2 protocol, the SDK can automatically retrieve the consent details.
### OR
- Through a dedicated SDK API: Developers can pass Google's required consent data directly to the SDK using a specific API designed for this purpose.

## Use CMP to collect consent data
A CMP compatible with TCF v2.2 collects DMA consent data and stores it in NSUserDefaults (iOS) and SharedPreferences (Android). To enable the SDK to access this data and include it with every event, follow these steps:
1. Call <code>AppsFlyer.enableTCFDataCollection({ shouldCollect: true });</code>
2. Call <code>AppsFlyer.init()</code>, then register a session-ready listener — SDK 7 is always manual-start, so `start()` is never called until you decide to.
3. From inside the session-ready callback, use the CMP to decide if you need the consent dialog in the current session to acquire the consent data. If you need the consent dialog move to step 4, otherwise move to step 5.
4. Get confirmation from the CMP that the user has made their consent decision and the data is available in NSUserDefaults/SharedPreferences.
5. Call <code>AppsFlyer.start()</code>, still from inside the session-ready callback.
```typescript
    AppsFlyer.enableTCFDataCollection({ shouldCollect: true });

    await AppsFlyer.init({
      appId: '1234567890',
      devKey: 'your_dev_key',
    });

  .......

  // CMP pseudocode procedure, run once the session-ready listener has fired —
  // request/confirm consent, then start(), both inside this callback
  AppsFlyer.registerSessionReadyListener(() => {
    if (cmpManager.hasConsent()) {
      AppsFlyer.start();
    } else {
      cmpManager.presentConsentDialogToUser().then(() => AppsFlyer.start());
    }
  });
```

## Manually collect consent data

> **Breaking change (7.0.2+):** the `AppsFlyerConsent` class (`.forGDPRUser()`/`.forNonGDPRUser()`)
> and `setConsentDataV2` are both gone. There is now a single `setConsentData` call that takes a
> plain object — no wrapper class, no v2 variant.

If your app does not use a CMP compatible with TCF v2.2, use `setConsentData` to provide the
consent data directly to the SDK, from inside the session-ready callback, **before** calling
`start()`:

```typescript
setConsentData(options: {
  isUserSubjectToGDPR: boolean;
  hasConsentForDataUsage?: boolean | null;
  hasConsentForAdsPersonalization?: boolean | null;
  hasConsentForAdStorage?: boolean | null;
}): Promise<void>;
```

- If a parameter is `null` or `undefined`, it means the user has **not explicitly provided
  consent** for that option.
- These values should be collected from the user via an appropriate **UI or consent prompt**
  before calling this method.

```typescript
await AppsFlyer.init({
  appId: '1234567890',
  devKey: 'your_dev_key',
});

AppsFlyer.registerSessionReadyListener(async () => {
  // Collect consent (from your own UI, or retrieve it from storage) before start().
  await AppsFlyer.setConsentData({
    isUserSubjectToGDPR: true,
    hasConsentForDataUsage: true,
    hasConsentForAdsPersonalization: false,
    hasConsentForAdStorage: null, // user has not explicitly provided consent
  });

  AppsFlyer.start();
});
```

For a user not subject to GDPR, pass `isUserSubjectToGDPR: false` and omit the rest.
