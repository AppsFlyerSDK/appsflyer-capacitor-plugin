import './ExploreContainer.css';
import { IonButton, isPlatform } from '@ionic/react';
import { AFEvent, AppsFlyer } from "appsflyer-capacitor-plugin";
import React from "react";

interface ContainerProps {
}

function logEventClicked() {
    const data: AFEvent = {
        eventName: 'test',
        eventValue: {
            af_revenue: 956,
            af_receipt_id: 'id536',
            af_currency: 'USD'
        }
    };
    AppsFlyer.logEvent(data)
        .then(r => alert('logEvent ~~>' + r.res))
        .catch(err => alert('logEvent err ~~>' + err));
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
        .then(v => alert('SDK Version: ' + v.res));
}

function myLogger(msg: string) {
    console.log('Paz_logger: ' + msg);
}

function getAppsFlyerID() {
    AppsFlyer.getAppsFlyerUID()
        .then(res => alert('AppsFlyer ID:' + res.uid));
}

function generateInviteLink() {
    AppsFlyer.generateInviteLink({
        addParameters: { code: '1256abc', page: '152' },
        campaign: 'appsflyer_plugin',
        channel: 'sms',
    })
        .then(r => alert('user invite link: ' + r.link))
        .catch(e => alert('user invite error: ' + e));
}

function validateAndLogInAppPurchase() {
    if (isPlatform('android')) {
        AppsFlyer.validateAndLogInAppPurchaseAndroid({
            additionalParameters: { aa: 'cc' },
            currency: 'usd',
            price: '20',
            signature: 'the_signature',
            publicKey: 'your_public_key',
            purchaseData: 'the_purchase_data'
        })
            .then(r => alert('validateAndLogInAppPurchase success: ' + r.res))
            .catch(e => alert('validateAndLogInAppPurchase error: ' + e));
    } else if (isPlatform('ios')) {
        AppsFlyer.validateAndLogInAppPurchaseIos({
            additionalParameters: { aa: 'cc' },
            currency: 'usd',
            price: '20',
            inAppPurchase: 'productIdentifier',
            transactionId: 'transactionId'
        })
            .then(r => alert('validateAndLogInAppPurchase success: ' + r.res))
            .catch(e => alert('validateAndLogInAppPurchase error: ' + JSON.stringify(e)));
    }
}

function validateAndLogInAppPurchaseV2() {
    alert('Not implemented yet');
    // const purchaseDetails: AFPurchaseDetails = {
    //     purchaseType: AFPurchaseType.oneTimePurchase,
    //     purchaseToken: isPlatform('android') ? 'android_purchase_token_example' : 'ios_transaction_id_example',
    //     productId: 'com.example.product.premium'
    // };

    // const additionalParams = {
    //     'test_param': 'test_value',
    //     'custom_data': 'example_data'
    // };
// 
    // AppsFlyer.validateAndLogInAppPurchaseV2({
    //     purchaseDetails: purchaseDetails,
    //     additionalParameters: additionalParams
    // })
    //     .then(result => {
    //         alert('validateAndLogInAppPurchaseV2 success: ' + JSON.stringify(result));
    //     })
    //     .catch(error => {
    //         alert('validateAndLogInAppPurchaseV2 error: ' + JSON.stringify(error));
    //     });
}

function validateAndLogInAppPurchaseV2Subscription() {
    alert('Not implemented yet');
    // const purchaseDetails: AFPurchaseDetails = {
    //     purchaseType: AFPurchaseType.subscription,
    //     purchaseToken: isPlatform('android') ? 'android_subscription_token_example' : 'ios_subscription_transaction_id_example',
    //     productId: 'com.example.subscription.monthly'
    // };

    // const additionalParams = {
    //     'subscription_period': 'monthly',
    //     'test_subscription': 'true'
    // };
// 
    // AppsFlyer.validateAndLogInAppPurchaseV2({
    //     purchaseDetails: purchaseDetails,
    //     additionalParameters: additionalParams
    // })
    //     .then(result => {
    
    //         alert('validateAndLogInAppPurchaseV2 (Subscription) success: ' + JSON.stringify(result));
    //     })
    //     .catch(error => 
    //         {
    //         alert('validateAndLogInAppPurchaseV2 (Subscription) error: ' + JSON.stringify(error));
    //     });
}

function setSharingFilterForAllPartners() {
    AppsFlyer.setSharingFilterForAllPartners();
}

function setSharingFilter() {
    AppsFlyer.setSharingFilter({ filters: ['google_int'] });
}

function anonymizeUser() {
    AppsFlyer.anonymizeUser({ anonymizeUser: true });
}

function stop() {
    AppsFlyer.stop()
        .then(res => { //return current state
            AppsFlyer.stop({ stop: !res.isStopped }) //change state
                .then(r => alert('isStopped: ' + r.isStopped)); //show state after change
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
    
      AppsFlyer.setConsentDataV2(consentOptions)
      .then(r => alert('setConsentDataV2 triggered'))
      .catch(e => alert('setConsentDataV2 returned error: ' + e));
}

function startSDK() {
    AppsFlyer.startSDK()
    .then(r => alert('startSDK triggered: ' + r.res))
    .catch(e => alert('startSDK returned error: ' + e));
}

function checkSdkState() {
    Promise.all([AppsFlyer.isSDKStarted(), AppsFlyer.isSDKStopped()])
        .then(([startedRes, stoppedRes]) => {
            alert(`SDK state => isStarted: ${startedRes.isStarted} | isStopped: ${stoppedRes.isStopped}`);
        })
        .catch(err => alert('SDK state error: ' + err));
}

const ExploreContainer: React.FC<ContainerProps> = () => {
    return (
        <div className="container">

            <IonButton color="primary" expand="block" onClick={() => logEventClicked()}>Log Event</IonButton>
            <IonButton color="primary" expand="block" onClick={() => brandedDomains()}>set branded domains</IonButton>
            <IonButton color="primary" expand="block" onClick={() => resolveDeepLinksUrls()}>set Resolve
                DeepLink</IonButton>
            <IonButton color="primary" expand="block" onClick={() => getSDKVersion()}>get sdk version</IonButton>
            <IonButton color="primary" expand="block" onClick={() => getAppsFlyerID()}>get AppsFlyer ID</IonButton>
            <IonButton color="primary" expand="block" onClick={() => anonymizeUser()}>Set Anonymize User</IonButton>
            <IonButton color="primary" expand="block" onClick={() => stop()}>Stop SDK</IonButton>
            <IonButton color="primary" expand="block" onClick={() => generateInviteLink()}>generate Invite
                Link</IonButton>
            <IonButton color="primary" expand="block" onClick={() => validateAndLogInAppPurchase()}>validate And Log
                IAP (Legacy)</IonButton>
            <IonButton color="success" expand="block" onClick={() => validateAndLogInAppPurchaseV2()}>validate And Log
                IAP V2 (One-time Purchase) - BETA</IonButton>
            <IonButton color="success" expand="block" onClick={() => validateAndLogInAppPurchaseV2Subscription()}>validate And Log
                IAP V2 (Subscription) - BETA</IonButton>
            <IonButton color="primary" expand="block" onClick={() => setSharingFilter()}>set Sharing Filter</IonButton>

            <IonButton color="primary" expand="block" onClick={() => setSharingFilterForAllPartners()}>set Sharing
                Filter For
                All
                Partners</IonButton>
            <IonButton color="primary" expand="block" onClick={() => sendConsentTest()}>set consentOptions</IonButton>
            <IonButton color="primary" expand="block" onClick={() => startSDK()}>StartSDK</IonButton>
            <IonButton color="primary" expand="block" onClick={() => checkSdkState()}>Check SDK State</IonButton>
        </div>
    );
};

export default ExploreContainer;
