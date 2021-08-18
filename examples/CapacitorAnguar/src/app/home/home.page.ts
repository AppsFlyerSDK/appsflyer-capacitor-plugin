import {Component} from '@angular/core';

import {Platform} from '@ionic/angular';
import {AFConstants, AFEvent, AFInit, AppsFlyer} from 'appsflyer-capacitor-plugin';
import {AppTrackingTransparency,} from 'capacitor-plugin-app-tracking-transparency';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(public platform: Platform) {
    this.platform.ready().then(() => {
      const options: AFInit = {
        appID: 'your_ios_app_id',
        devKey: 'replace_with_your_dev_key',
        isDebug: true,
        waitForATTUserAuthorization: 10,
        registerOnDeepLink: true,
        minTimeBetweenSessions: 6,
        registerConversionListener: true,
        registerOnAppOpenAttribution: false,
        useReceiptValidationSandbox: true,
        useUninstallSandbox: true
      };
      this.runAppsFlyerAPIs();
      this.setConversions();
      this.setUDL();
      this.setOAOA();
      AppsFlyer.initSDK(options).then(res => alert(JSON.stringify(res))).catch(e => alert(e));
      AppTrackingTransparency.requestPermission().then(res => alert('ATT status: ' + res.status));
    });
  }

  // set a listener
  setConversions() {
    AppsFlyer.addListener(AFConstants.CONVERSION_CALLBACK, event => {
      alert('CONVERSION_CALLBACK ~~>' + JSON.stringify(event));
      if (event.callbackName === AFConstants.onConversionDataSuccess) {
        if (event.data.af_status === 'Non-organic') {
          if (event.data.is_first_launch === true) {
            const deepLinkValue = event.data.deep_link_value;
            this.handleLink(deepLinkValue);
          }
        }
      }
    });
  }

  handleLink(deepLinkValue: string) {
    console.log(deepLinkValue);
  }

  setUDL() {
    AppsFlyer.addListener(AFConstants.UDL_CALLBACK, res => {
      alert('UDL_CALLBACK ~~>' + JSON.stringify(res));
      if (res.status === 'FOUND') {
        const deepLinkValue = res.deepLink.deep_link_value;
        this.handleLink(deepLinkValue);
      } else if (res.status === 'ERROR') {
        console.log('udl error: ' + res.error);
      }
    });

    // AppsFlyer.addListener(AFConstants.UDL_CALLBACK, res => {
    //   alert('UDL_CALLBACK ~~>' + JSON.stringify(res));
    //   if (res.status === 'FOUND') {
    //     console.log('deep link found');
    //   } else if (res.status === 'ERROR') {
    //     console.log('deep link error');
    //   } else {
    //     console.log('deep link not found');
    //   }
    // });
  }

  // set a listener
  setOAOA() {
    AppsFlyer.addListener(AFConstants.OAOA_CALLBACK, res => {
      alert('OAOA_CALLBACK ~~>' + JSON.stringify(res));
      if (res.callbackName === AFConstants.onAppOpenAttribution) {
        const deepLinkValue = res.data.deep_link_value;
        this.handleLink(deepLinkValue);
      } else {
        console.log(res.errorMessage);
      }
    });

  }

  logEvent() {
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

  brandedDomains() {
    AppsFlyer.setOneLinkCustomDomain({domains: ['af', 'lavi', 'aaa']});
    this.myLogger('brandedDomains');

  }

  resolveDeepLinksUrls() {
    AppsFlyer.setResolveDeepLinkURLs({urls: ['af', 'apps', 'appsflyer']});
    this.myLogger('ResolveDeepLinksUrls');

  }

  getSDKVersion() {
    AppsFlyer.getSdkVersion()
      .then(v => alert('SDK Version: ' + v.res));
  }

  myLogger(msg: string) {
    console.log('Paz_logger: ' + msg);
  }

  getAppsFlyerID() {
    AppsFlyer.getAppsFlyerUID()
      .then(res => alert('AppsFlyer ID:' + res.uid));
  }

  generateInviteLink() {
    AppsFlyer.generateInviteLink({
      addParameters: {code: '1256abc', page: '152'},
      campaign: 'appsflyer_plugin',
      channel: 'sms',
    })
      .then(r => alert('user invite link: ' + r.link))
      .catch(e => alert('user invite error: ' + e));
  }

  validateAndLogInAppPurchase() {
    if (this.platform.is('android')) {
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
    } else if (this.platform.is('ios')) {
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

  setSharingFilterForAllPartners() {
    AppsFlyer.setSharingFilterForAllPartners();
  }

  setSharingFilter() {
    AppsFlyer.setSharingFilter({filters: ['google_int']});
  }

  anonymizeUser() {
    AppsFlyer.anonymizeUser({anonymizeUser: true});
  }

  stop() {
    AppsFlyer.stop()
      .then(res => { //return current state
        AppsFlyer.stop({stop: !res.isStopped}) //change state
          .then(r => alert('isStopped: ' + r.isStopped)); //show state after change
      });
  }

  sendPushNotificationData() {
    AppsFlyer.sendPushNotificationData({
      pushPayload: {af: '{"pid":"media_int","is_retargeting":"true", "c":"test_campaign"}'} //replace with push payload
    });
  }

  private runAppsFlyerAPIs() {
    //AppsFlyer.setHost({hostName:'af',hostPrefixName:'cn'});
    //AppsFlyer.disableAdvertisingIdentifier({shouldDisable:true});
    //AppsFlyer.disableCollectASA({shouldDisable:true});
    //AppsFlyer.disableSKAdNetwork({shouldDisable:true});
    AppsFlyer.setCurrentDeviceLanguage({language: 'en'})
      .then(res => console.log(res.res))
      .catch(e => console.log(e));
    AppsFlyer.setAppInviteOneLink({onelinkID: 'your_onelink_id'}).then();
    AppsFlyer.setCustomerUserId({cuid: 'csadadadad'});
    AppsFlyer.setCurrencyCode({currencyCode: 'ILS'});
    AppsFlyer.updateServerUninstallToken({token: 'fdsffddfbnjdfoiuvhof'});
    AppsFlyer.setOneLinkCustomDomain({domains: ['promotion.greatapp.com', 'click.greatapp.com', 'deals.greatapp.com']});
    AppsFlyer.appendParametersToDeepLinkingURL({
      contains: 'paz',
      parameters: {
        is_retargeting: 'true', //Required
        pid: 'cap_app', //Required
        my_param: 'xyz'
      }
    });
    AppsFlyer.setResolveDeepLinkURLs({urls: ['af', 'appsflyer']});
    AppsFlyer.addPushNotificationDeepLinkPath({path: ['paz', 'a', 'b']});
    AppsFlyer.setAdditionalData({
      additionalData: {
        capacitor: 'plugin',
        apps: 'Flyer'
      }
    });

  //   AppsFlyer.enableFacebookDeferredApplinks({enableFacebookDAL: true})
  //     .then(res => alert(res.res))
  //     .catch(e => alert(e));
  //
   }
}
