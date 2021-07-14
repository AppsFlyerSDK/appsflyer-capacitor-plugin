import type {PluginListenerHandle} from "@capacitor/core";

import type  {AFConstants} from "./Appsflyer_constants";
import type {
    AFInit,
    AFEvent,
    OnAppOpenAttribution,
    OnConversionDataResult,
    OnDeepLink,
    AFUninstall,
    AFCurrency,
    AFCuid,
    AFOnelinkID,
    AFOnelinkDomain,
    AFUrls,
    AFUid,
    AFAnonymizeUser,
    AFStop,
    AFIsStopped,
    AFPath,
    AFFilters,
    AFData,
    AFDisable,
    AFHost,
    AFLinkGenerator,
    AFRes,
    AFLink,
    AFAndroidInAppPurchase, AFIosInAppPurchase, AFFbDAL, AFPushPayload, AFAppendToDeepLink
} from "./appsflyer_interfaces";

export interface AppsFlyerPlugin {
    // register listener for onConversionDataSuccess and onConversionDataFail
    addListener(
        eventName: AFConstants.CONVERSION_CALLBACK,
        listenerFunc: (event: OnConversionDataResult) => void,
    ): PluginListenerHandle;

    // register listener for onAppOpenAttribution and onAttributionFailure
    addListener(
        eventName: AFConstants.OAOA_CALLBACK,
        listenerFunc: (event: OnAppOpenAttribution) => void,
    ): PluginListenerHandle;

    // register listener for onDeeplink
    addListener(
        eventName: AFConstants.UDL_CALLBACK,
        listenerFunc: (event: OnDeepLink) => void,
    ): PluginListenerHandle;

    initSDK(options: AFInit): Promise<AFRes>;

    logEvent(date: AFEvent): Promise<AFRes>

    setCustomerUserId(cuid: AFCuid): Promise<void>

    setCurrencyCode(currencyCode: AFCurrency): Promise<void>

    updateServerUninstallToken(token: AFUninstall): Promise<void>

    setAppInviteOneLink(id: AFOnelinkID): Promise<void>

    setOneLinkCustomDomain(domains: AFOnelinkDomain): Promise<void>

    appendParametersToDeepLinkingURL(data: AFAppendToDeepLink): Promise<void>

    setResolveDeepLinkURLs(urls: AFUrls): Promise<void>

    addPushNotificationDeepLinkPath(path: AFPath): Promise<void>

    setSharingFilter(filters: AFFilters): Promise<void>

    setSharingFilterForAllPartners(): Promise<void>

    setAdditionalData(additionalData : AFData): Promise<void>

    getAppsFlyerUID(): Promise<AFUid>

    anonymizeUser(anonymize:AFAnonymizeUser): Promise<void>

    stop(stop?:AFStop): Promise<AFIsStopped>

    disableSKAdNetwork(stop:AFDisable): Promise<void>

    disableAdvertisingIdentifier(stop:AFDisable): Promise<void>

    disableCollectASA(stop:AFDisable): Promise<void>

    setHost(hostName:AFHost): Promise<void>

    generateInviteLink(params : AFLinkGenerator): Promise<AFLink>;

    validateAndLogInAppPurchaseAndroid(purchaseData:AFAndroidInAppPurchase): Promise<AFRes>;

    validateAndLogInAppPurchaseIos(purchaseData:AFIosInAppPurchase): Promise<AFRes>;

    getSdkVersion(): Promise<AFRes>;

    enableFacebookDeferredApplinks(enable:AFFbDAL): Promise<AFRes>;

    sendPushNotificationData(payload:AFPushPayload): Promise<void>;

}

