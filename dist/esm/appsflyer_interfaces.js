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
export const AppsFlyerConsent = {
    forGDPRUser: AppsFlyerConsentClass.forGDPRUser,
    forNonGDPRUser: AppsFlyerConsentClass.forNonGDPRUser
};
//# sourceMappingURL=appsflyer_interfaces.js.map