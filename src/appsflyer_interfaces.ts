import type {MediationNetwork} from "./Appsflyer_constants";

export interface AFInit{
    devKey: string;
    appID: string;
    isDebug?: boolean;
    waitForATTUserAuthorization?: number;
    registerConversionListener?: boolean;
    registerOnAppOpenAttribution?: boolean;
    registerOnDeepLink?: boolean;
    useUninstallSandbox?: boolean;
    useReceiptValidationSandbox?: boolean;
    minTimeBetweenSessions?: number
    deepLinkTimeout?: number
    manualStart?: boolean;
}

export interface AFEvent{
    eventName?: string;
    eventValue?: any;
}

export interface OnConversionDataResult{
    callbackName:string;
    errorMessage?: string;
    data?: any;
}

export interface OnAppOpenAttribution{
    callbackName:string;
    errorMessage?: string;
    data?: any;
}
export interface OnDeepLink{
    status:string;
    error?:string;
    deepLink?:any;
}
export interface StringMap { [key: string]: string; }

export interface AFLinkGenerator{
    brandDomain?: string;
    campaign?: string;
    channel? : string;
    referrerName? : string;
    referrerImageURL? : string;
    referrerCustomerId? : string;
    baseDeeplink? : string; //af_dp
    addParameters? : StringMap;
}

export interface AFInAppPurchase{
    currency: string;
    additionalParameters?:StringMap;
}

export interface AFAndroidInAppPurchase extends AFInAppPurchase{
    publicKey: string;
    signature: string;
    purchaseData: string;
    price:string
}

export interface AFIosInAppPurchase extends AFInAppPurchase{
    inAppPurchase: string;
    price: string;
    transactionId: string;
}

export interface AFPromotion {
    appID:string,
    campaign:string,
    parameters:StringMap,
}

export interface AFLatLng{
    latitude: number,
    longitude: number
}
export interface AFPartnerData{
    data: any,
    partnerId: string
}
export interface AFLogInvite{
    eventParameters: StringMap,
    channel: string
}
export interface AFLink {link:string}
export interface AFRes {res:string}
export interface AFUninstall {token: string}
export interface AFUid {uid: string}
export interface AFCurrency {currencyCode: string}
export interface AFCuid {cuid: string}
export interface AFAnonymizeUser {anonymizeUser: boolean}
export interface AFOnelinkID {onelinkID: string}
export interface AFOnelinkDomain {domains: string[]}
export interface AFUrls {urls: string[]}
export interface AFPath {path: string[]}
export interface AFEmails {emails: string[],
    encode?: boolean}
export interface AFStop {stop: boolean}
export interface AFIsStopped {isStopped: boolean}
export interface AFFilters{filters: string[]}
export interface AFData{additionalData: any}
export interface AFDisable{shouldDisable: boolean}
export interface AFFbDAL{enableFacebookDAL: boolean}
export interface AFPushPayload{pushPayload: StringMap}
export interface AFLanguage{language: string}
export interface AFPhone{phone: string}
export interface AFHost{hostPrefixName: string;
    hostName: string;
}
export interface AFAppendToDeepLink{contains: string;
    parameters: StringMap;
}

export interface AFEnableTCFDataCollection { shouldEnableTCFDataCollection: boolean }

export interface IAppsFlyerConsent {
    isUserSubjectToGDPR: boolean,
    hasConsentForDataUsage?: boolean,
    hasConsentForAdsPersonalization?: boolean
}

class AppsFlyerConsentClass implements IAppsFlyerConsent {
    public isUserSubjectToGDPR: boolean;
    public hasConsentForDataUsage?: boolean;
    public hasConsentForAdsPersonalization?: boolean;

    private constructor(isUserSubjectToGDPR: boolean, hasConsentForDataUsage?: boolean, hasConsentForAdsPersonalization?: boolean) {
        this.isUserSubjectToGDPR = isUserSubjectToGDPR;
        this.hasConsentForDataUsage = hasConsentForDataUsage;
        this.hasConsentForAdsPersonalization = hasConsentForAdsPersonalization;
    }

    static forGDPRUser(hasConsentForDataUsage: boolean, hasConsentForAdsPersonalization: boolean): IAppsFlyerConsent {
        return new AppsFlyerConsentClass(true, hasConsentForDataUsage, hasConsentForAdsPersonalization);
    }

    static forNonGDPRUser(): IAppsFlyerConsent {
        return new AppsFlyerConsentClass(false);
    }
}

export const AppsFlyerConsent = {
    forGDPRUser: AppsFlyerConsentClass.forGDPRUser,
    forNonGDPRUser: AppsFlyerConsentClass.forNonGDPRUser
};

export interface AFConsentData {
    data: IAppsFlyerConsent
}

export interface AFAdRevenueData {
    monetizationNetwork: string;
    mediationNetwork: MediationNetwork;
    currencyIso4217Code: string;
    revenue: number;
    additionalParameters?: StringMap;
  }