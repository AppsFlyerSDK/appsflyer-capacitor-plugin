import './ExploreContainer.css';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, isPlatform } from '@ionic/react';
import { AFPurchaseType, AppsFlyer, LogEventParams } from "appsflyer-capacitor-plugin";
import React from "react";

interface ContainerProps {
}

function logEventClicked() {
    const data: LogEventParams = {
        eventName: 'test',
        eventValues: {
            af_revenue: 956,
            af_receipt_id: 'id536',
            af_currency: 'USD'
        }
    };
    AppsFlyer.logEvent(data)
        .then(() => console.log('logEvent triggered'))
        .catch(err => console.log('logEvent err ~~>' + err));
}


function brandedDomains() {
    AppsFlyer.setOneLinkCustomDomain({ domains: ['paz', 'lavi', 'aaa'] });
    myLogger('brandedDomains');

}

function resolveDeepLinksUrls() {
    AppsFlyer.setResolveDeepLinkURLs({ urls: ['af', 'apps', 'appsflyer'] });
    myLogger('ResolveDeepLinksUrls');

}

function getSDKVersion() {
    AppsFlyer.getSdkVersion()
        .then(version => console.log('SDK Version: ' + version));
}

function myLogger(msg: string) {
    console.log('Paz_logger: ' + msg);
}

function getAppsFlyerID() {
    AppsFlyer.getAppsFlyerUID()
        .then(uid => console.log('AppsFlyer ID:' + uid));
}

function generateInviteLink() {
    AppsFlyer.generateInviteLink({
        parameters: { code: '1256abc', page: '152', campaign: 'appsflyer_plugin', channel: 'sms' },
    })
        .then(link => console.log('user invite link: ' + link))
        .catch(e => console.log('user invite error: ' + e));
}

function validateAndLogInAppPurchase(purchaseType: AFPurchaseType) {
    AppsFlyer.validateAndLogInAppPurchase({
        purchase: {
            purchaseType,
            purchaseToken: isPlatform('android') ? 'android_purchase_token_example' : 'ios_transaction_id_example',
            productId: purchaseType === AFPurchaseType.subscription ? 'com.example.subscription.monthly' : 'com.example.product.premium',
        },
        additionalParameters: {
            'test_param': 'test_value',
            'custom_data': 'example_data'
        }
    })
        .then(result => {
            console.log('validateAndLogInAppPurchase success: ' + JSON.stringify(result));
        })
        .catch(error => {
            console.log('validateAndLogInAppPurchase error: ' + JSON.stringify(error));
        });
}

function setSharingFilterForAllPartners() {
    AppsFlyer.setSharingFilterForPartners({ partners: null });
}

function setSharingFilter() {
    AppsFlyer.setSharingFilterForPartners({ partners: ['google_int'] });
}

function anonymizeUser() {
    AppsFlyer.anonymizeUser({ shouldAnonymize: true });
}

function stop() {
    AppsFlyer.isStopped().then(isStopped => {
        AppsFlyer.stop({ shouldStop: !isStopped }) //toggle state
            .then(() => console.log('isStopped: ' + !isStopped));
    });
}

// function logAdRevenueExample() {
//     const myAdditionalParams = {
//         spong: 'bob',
//         doctor: 'who'
//     };
//     const data: AFAdRevenueData = {
//         monetizationNetwork: "MoneyMoneyMoney",
//         mediationNetwork: MediationNetwork.APPLOVIN_MAX,
//         currencyIso4217Code: "USD",
//         revenue: 200.0,
//         additionalParameters: myAdditionalParams
//     };

//     AppsFlyer.logAdRevenue(data)
//         .then(r => alert('logAdRevenue triggered'))
//         .catch(e => alert('logAdRevenue returned error: ' + e));
// }

// function sendPushNotificationData() {
//     AppsFlyer.sendPushNotificationData({
//         pushPayload: { af: '{"pid":"media_int","is_retargeting":"true", "c":"test_campaign"}' } //replace with push payload
//     });
// }

function sendConsentTest() {
    AppsFlyer.disableAppSetId()
    const consentOptions = {
        isUserSubjectToGDPR: true,
        hasConsentForDataUsage: true,
        hasConsentForAdsPersonalization: false,
        hasConsentForAdStorage: null
        };
    
      AppsFlyer.setConsentData(consentOptions)
      .then(() => console.log('setConsentData triggered'))
      .catch(e => console.log('setConsentData returned error: ' + e));
}

function startSDK() {
    AppsFlyer.start()
    .then(() => console.log('start() triggered'))
    .catch(e => console.log('start() returned error: ' + e));
}

function checkSdkState() {
    AppsFlyer.isStopped()
        .then(isStopped => console.log(`SDK state => isStopped: ${isStopped}`))
        .catch(err => console.log('SDK state error: ' + err));
}

const ExploreContainer: React.FC<ContainerProps> = () => {
    return (
        <div className="container">
            <IonCard>
                <IonCardHeader>
                    <IonCardTitle>Attribution & Deep Linking</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <IonButton expand="block" onClick={() => brandedDomains()}>Set Branded Domains</IonButton>
                    <IonButton expand="block" onClick={() => resolveDeepLinksUrls()}>Set Resolve Deep Link URLs</IonButton>
                    <IonButton expand="block" onClick={() => generateInviteLink()}>Generate Invite Link</IonButton>
                </IonCardContent>
            </IonCard>

            <IonCard>
                <IonCardHeader>
                    <IonCardTitle>Events & Purchases</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <IonButton expand="block" onClick={() => logEventClicked()}>Log Event</IonButton>
                    <IonButton expand="block" onClick={() => validateAndLogInAppPurchase(AFPurchaseType.oneTimePurchase)}>Validate IAP (One-time Purchase)</IonButton>
                    <IonButton expand="block" onClick={() => validateAndLogInAppPurchase(AFPurchaseType.subscription)}>Validate IAP (Subscription)</IonButton>
                </IonCardContent>
            </IonCard>

            <IonCard>
                <IonCardHeader>
                    <IonCardTitle>Privacy & Consent</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <IonButton expand="block" onClick={() => setSharingFilter()}>Set Sharing Filter</IonButton>
                    <IonButton expand="block" onClick={() => setSharingFilterForAllPartners()}>Set Sharing Filter For All Partners</IonButton>
                    <IonButton expand="block" onClick={() => anonymizeUser()}>Set Anonymize User</IonButton>
                    <IonButton expand="block" onClick={() => sendConsentTest()}>Set Consent Options</IonButton>
                </IonCardContent>
            </IonCard>

            <IonCard>
                <IonCardHeader>
                    <IonCardTitle>SDK Control</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <IonButton expand="block" onClick={() => getSDKVersion()}>Get SDK Version</IonButton>
                    <IonButton expand="block" onClick={() => getAppsFlyerID()}>Get AppsFlyer ID</IonButton>
                    <IonButton expand="block" onClick={() => startSDK()}>Start SDK</IonButton>
                    <IonButton expand="block" onClick={() => stop()}>Stop SDK</IonButton>
                    <IonButton expand="block" onClick={() => checkSdkState()}>Check SDK State</IonButton>
                </IonCardContent>
            </IonCard>
        </div>
    );
};

export default ExploreContainer;
