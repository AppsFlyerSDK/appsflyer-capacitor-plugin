'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@capacitor/core');

exports.AFConstants = void 0;
(function (AFConstants) {
    AFConstants["onConversionDataSuccess"] = "onConversionDataSuccess";
    AFConstants["onConversionDataFail"] = "onConversionDataFail";
    AFConstants["onAppOpenAttribution"] = "onAppOpenAttribution";
    AFConstants["onAttributionFailure"] = "onAttributionFailure";
    AFConstants["CONVERSION_CALLBACK"] = "conversion_callback";
    AFConstants["OAOA_CALLBACK"] = "oaoa_callback";
    AFConstants["UDL_CALLBACK"] = "udl_callback";
})(exports.AFConstants || (exports.AFConstants = {}));
exports.AFPurchaseType = void 0;
(function (AFPurchaseType) {
    AFPurchaseType["oneTimePurchase"] = "one_time_purchase";
    AFPurchaseType["subscription"] = "subscription";
})(exports.AFPurchaseType || (exports.AFPurchaseType = {}));
exports.MediationNetwork = void 0;
(function (MediationNetwork) {
    MediationNetwork["IRONSOURCE"] = "ironsource";
    MediationNetwork["APPLOVIN_MAX"] = "applovin_max";
    MediationNetwork["GOOGLE_ADMOB"] = "google_admob";
    MediationNetwork["FYBER"] = "fyber";
    MediationNetwork["APPODEAL"] = "appodeal";
    MediationNetwork["ADMOST"] = "admost";
    MediationNetwork["TOPON"] = "topon";
    MediationNetwork["TRADPLUS"] = "tradplus";
    MediationNetwork["YANDEX"] = "yandex";
    MediationNetwork["CHARTBOOST"] = "chartboost";
    MediationNetwork["UNITY"] = "unity";
    MediationNetwork["TOPON_PTE"] = "topon_pte";
    MediationNetwork["CUSTOM_MEDIATION"] = "custom_mediation";
    MediationNetwork["DIRECT_MONETIZATION_NETWORK"] = "direct_monetization_network";
})(exports.MediationNetwork || (exports.MediationNetwork = {}));

class AppsFlyerConsentClass {
    constructor(isUserSubjectToGDPR, hasConsentForDataUsage, hasConsentForAdsPersonalization) {
        this.isUserSubjectToGDPR = isUserSubjectToGDPR;
        this.hasConsentForDataUsage = hasConsentForDataUsage;
        this.hasConsentForAdsPersonalization = hasConsentForAdsPersonalization;
    }
    static forGDPRUser(hasConsentForDataUsage, hasConsentForAdsPersonalization) {
        return new AppsFlyerConsentClass(true, hasConsentForDataUsage, hasConsentForAdsPersonalization);
    }
    static forNonGDPRUser() {
        return new AppsFlyerConsentClass(false);
    }
}
const AppsFlyerConsent = {
    forGDPRUser: AppsFlyerConsentClass.forGDPRUser,
    forNonGDPRUser: AppsFlyerConsentClass.forNonGDPRUser
};

const AppsFlyer = core.registerPlugin('AppsFlyerPlugin', {});

exports.AppsFlyer = AppsFlyer;
exports.AppsFlyerConsent = AppsFlyerConsent;
//# sourceMappingURL=plugin.cjs.js.map
