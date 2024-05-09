import type {PluginListenerHandle} from "@capacitor/core";

import type {AFConstants} from "./Appsflyer_constants";
import type {
    AFAndroidInAppPurchase,
    AFAnonymizeUser,
    AFAppendToDeepLink,
    AFCuid,
    AFCurrency,
    AFData,
    AFDisable,
    AFEvent,
    AFFbDAL,
    AFFilters,
    AFHost,
    AFInit,
    AFIosInAppPurchase,
    AFIsStopped,
    AFLink,
    AFLinkGenerator,
    AFOnelinkDomain,
    AFOnelinkID,
    AFPath,
    AFPushPayload,
    AFRes,
    AFStop,
    AFUid,
    AFUninstall,
    AFUrls,
    AFLanguage,
    OnAppOpenAttribution,
    OnConversionDataResult,
    OnDeepLink,
    AFPromotion,
    AFEmails,
    AFLatLng,
    AFPhone,
    AFPartnerData,
    AFLogInvite,
    AFEnableTCFDataCollection,
    AFConsentData

} from "./appsflyer_interfaces";

export interface AppsFlyerPlugin {
    // register listener for onConversionDataSuccess and onConversionDataFail
    addListener(
        eventName: AFConstants.CONVERSION_CALLBACK,
        listenerFunc: (event: OnConversionDataResult) => void,
    ): Promise<PluginListenerHandle>;

    // register listener for onAppOpenAttribution and onAttributionFailure
    addListener(
        eventName: AFConstants.OAOA_CALLBACK,
        listenerFunc: (event: OnAppOpenAttribution) => void,
    ): Promise<PluginListenerHandle>;

    // register listener for onDeeplink
    addListener(
        eventName: AFConstants.UDL_CALLBACK,
        listenerFunc: (event: OnDeepLink) => void,
    ): Promise<PluginListenerHandle>;

    /**
     * Use this method to initialize and start AppsFlyer SDK. This API should be called as soon as the app launched.
     */
    initSDK(options: AFInit): Promise<AFRes>;

    /**
     * Use this method to start AppsFlyer SDK, only on manual start mode. 
     */
    startSDK(): Promise<AFRes>;

    /**
     * Log an in-app event.
     *
     * */
    logEvent(data: AFEvent): Promise<AFRes>

    /**
     * Setting your own customer ID enables you to cross-reference your own unique ID with AppsFlyer’s unique ID and other devices’ IDs.
     * This ID is available in raw-data reports and in the Postback APIs for cross-referencing with your internal IDs.
     */
    setCustomerUserId(cuid: AFCuid): Promise<void>

    /**
     * Sets the currency for in-app purchases. The currency code should be a 3 character ISO 4217 code
     * */
    setCurrencyCode(currencyCode: AFCurrency): Promise<void>

    /**
     * (Android) Allows to pass GCM/FCM Tokens that where collected by third party plugins to the AppsFlyer server. Can be used for Uninstall log.
     * (iOS) Allows to pass APN Tokens that where collected by third party plugins to the AppsFlyer server. Can be used for log Uninstall.
     */
    updateServerUninstallToken(token: AFUninstall): Promise<void>

    /**
     * Set the OneLink ID that should be used for attributing user-Invite. The link that is generated for the user invite will use this OneLink as the base link.
     */
    setAppInviteOneLink(id: AFOnelinkID): Promise<void>

    /**
     * In order for AppsFlyer SDK to successfully resolve hidden (decoded in shortlink ID) attribution parameters, any domain that is configured as a branded domain in the AppsFlyer Dashboard should be provided to this method.
     */
    setOneLinkCustomDomain(domains: AFOnelinkDomain): Promise<void>

    /**
     * Enables app owners using App Links for deep linking (without OneLink) to attribute sessions initiated via a domain associated with their app. Call this method before calling start.
     * You must provide the following parameters in the parameters Map:
     * pid
     * is_retargeting must be set to true
     * */
    appendParametersToDeepLinkingURL(data: AFAppendToDeepLink): Promise<void>

    /**
     *Advertisers can wrap an AppsFlyer OneLink within another Universal Link. This Universal Link will invoke the app but any deep linking data will not propagate to AppsFlyer.
     * setResolveDeepLinkURLs enables you to configure the SDK to resolve the wrapped OneLink URLs, so that deep linking can occur correctly.
     */
    setResolveDeepLinkURLs(urls: AFUrls): Promise<void>

    /**
     * Configures how the SDK extracts deep link values from push notification payloads.
     */
    addPushNotificationDeepLinkPath(path: AFPath): Promise<void>

    /**
     * Stops events from propagating to the specified AppsFlyer partners.
     * @deprecated deprecated since 6.4.0. Use setSharingFilterForPartners instead
     */
    setSharingFilter(filters: AFFilters): Promise<void>

    /**
     * Stops events from propagating to all AppsFlyer partners. Overwrites setSharingFilter.
     *  @deprecated deprecated since 6.4.0. Use setSharingFilterForPartners instead
     */
    setSharingFilterForAllPartners(): Promise<void>

    /**
     * Stops events from propagating to the specified AppsFlyer partners.
     */
    setSharingFilterForPartners(filters: AFFilters): Promise<void>

    /**
     * Set additional data to be sent to AppsFlyer. See
     */
    setAdditionalData(additionalData: AFData): Promise<void>

    /**
     * Get AppsFlyer's unique device ID (created for every new install of an app).
     */
    getAppsFlyerUID(): Promise<AFUid>

    /**
     * End User Opt-Out from AppsFlyer analytics (Anonymize user data).
     */
    anonymizeUser(anonymize: AFAnonymizeUser): Promise<void>

    /**
     * Once this API is invoked, our SDK no longer communicates with our servers and stops functioning.
     * Useful when implementing user opt-in/opt-out.
     */
    stop(stop?: AFStop): Promise<AFIsStopped>

    /**
     * Opt-out of SKAdNetwork
     *
     */
    disableSKAdNetwork(stop: AFDisable): Promise<void>

    /**
     * Disables collection of various Advertising IDs by the SDK. This includes Apple Identity for Advertisers (IDFA), Google Advertising ID (GAID), OAID and Amazon Advertising ID (AAID).
     */
    disableAdvertisingIdentifier(stop: AFDisable): Promise<void>

    /**
     * Opt-out of Apple Search Ads attributions.
     */
    disableCollectASA(stop: AFDisable): Promise<void>

    /**
     * Set a custom host.
     */
    setHost(hostName: AFHost): Promise<void>

    /**
     *  Allowing your existing users to invite their friends and contacts as new users to your app
     */
    generateInviteLink(params: AFLinkGenerator): Promise<AFLink>;

    /**
     * API for server verification of in-app purchases. An af_purchase event with the relevant values will be automatically logged if the validation is successful.
     */
    validateAndLogInAppPurchaseAndroid(purchaseData: AFAndroidInAppPurchase): Promise<AFRes>;

    validateAndLogInAppPurchaseIos(purchaseData: AFIosInAppPurchase): Promise<AFRes>;

    /**
     * Get the AppsFlyer SDK version used in app.
     */
    getSdkVersion(): Promise<AFRes>;

    /**
     * Enable the collection of Facebook Deferred AppLinks. Requires Facebook SDK and Facebook app on target/client device.
     * This API must be invoked before initializing the AppsFlyer SDK in order to function properly.
     */
    enableFacebookDeferredApplinks(enable: AFFbDAL): Promise<AFRes>;

    /**
     * Measure and get data from push-notification campaigns.
     */
    sendPushNotificationData(payload: AFPushPayload): Promise<void>;

    /**
     * Set the language of the device. The data will be displayed in Raw Data Reports
     * 
     */
    setCurrentDeviceLanguage(language: AFLanguage): Promise<AFRes>;

    /**
     * logs an impression as part of a cross-promotion campaign. Make sure to use the promoted App ID as it appears within the AppsFlyer dashboard.
     *
     */
    logCrossPromoteImpression(data: AFPromotion): Promise<AFRes>;

    /**
     * Set the user emails and encrypt them.
     */
    setUserEmails(emails: AFEmails): Promise<AFRes>;

    /**
     * Manually log the location of the user
     */
    logLocation(latLng : AFLatLng): Promise<AFRes>;

    /**
     * Will be sent as an SHA-256 encrypted string.
     */
    setPhoneNumber(phone : AFPhone): Promise<AFRes>;

    /**
     * Allows sending custom data for partner integration purposes.
     */
    setPartnerData(data : AFPartnerData): Promise<AFRes>;

    /**
     * Use to log a user-invite in-app event (af_invite).
     * 
     */
    logInvite(data : AFLogInvite): Promise<AFRes>;

    /**
     * Use to opt-out of collecting the network operator name (carrier) and sim operator name from the device.
     *
     * @param disable Defaults to false
     */
    setDisableNetworkData(disable : AFDisable): Promise<void>;

    /**
     * Use to opt-in/out the automatic collection of consent data, for users who use a CMP. 
     * Flag value will be persisted between app sessions.
     */
    enableTCFDataCollection(shouldEnableTCFDataCollection: AFEnableTCFDataCollection): Promise<void>
    
    /**
    * Use to set user consent data manualy. 
    * if your app doesn't use a CMP compatible with TCF v2.2, use the following method to manualy provide the consent data directly to the SDK.
    * @param  data: AppsFlyerConsent object.
    */
    setConsentData(data : AFConsentData): Promise<void>
    
}

