import './ExploreContainer.css';
import {IonButton, isPlatform} from '@ionic/react';
import {AFEvent, AppsFlyer} from "appsflyer-capacitor-plugin";
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
    AppsFlyer.setOneLinkCustomDomain({domains: ['paz', 'lavi', 'aaa']});
    myLogger('brandedDomains');

}

function resolveDeepLinksUrls() {
    AppsFlyer.setResolveDeepLinkURLs({urls: ['af', 'apps', 'appsflyer']});
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
        addParameters: {code: '1256abc', page: '152'},
        campaign: 'appsflyer_plugin',
        channel: 'sms',
    })
        .then(r => alert('user invite link: ' + r.link))
        .catch(e => alert('user invite error: ' + e));
}

function validateAndLogInAppPurchase() {
    if (isPlatform('android')) {
        AppsFlyer.validateAndLogInAppPurchaseAndroid({
            additionalParameters: {aa: 'cc'},
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
            additionalParameters: {aa: 'cc'},
            currency: 'usd',
            price: '20',
            inAppPurchase: 'productIdentifier',
            transactionId: 'transactionId'
        })
            .then(r => alert('validateAndLogInAppPurchase success: ' + r.res))
            .catch(e => alert('validateAndLogInAppPurchase error: ' + JSON.stringify(e)));
    }
}

function setSharingFilterForAllPartners() {
    AppsFlyer.setSharingFilterForAllPartners();
}

function setSharingFilter() {
    AppsFlyer.setSharingFilter({filters: ['google_int']});
}

function anonymizeUser() {
    AppsFlyer.anonymizeUser({anonymizeUser: true});
}

function stop() {
    AppsFlyer.stop()
        .then(res => { //return current state
            AppsFlyer.stop({stop: !res.isStopped}) //change state
                .then(r => alert('isStopped: ' + r.isStopped)); //show state after change
        });
}

function sendPushNotificationData() {
    AppsFlyer.sendPushNotificationData({
        pushPayload: {af: '{"pid":"media_int","is_retargeting":"true", "c":"test_campaign"}'} //replace with push payload
    });
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
                IAP</IonButton>
            <IonButton color="primary" expand="block" onClick={() => setSharingFilter()}>set Sharing Filter</IonButton>

            <IonButton color="primary" expand="block" onClick={() => setSharingFilterForAllPartners()}>set Sharing
                Filter For
                All
                Partners</IonButton>
        </div>
    );
};

export default ExploreContainer;
