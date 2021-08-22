import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import {AFConstants, AppsFlyer} from "appsflyer-capacitor-plugin";
import {AppTrackingTransparency} from "capacitor-plugin-app-tracking-transparency";
import React, {useState} from "react";
function initAppsFlyer() {

  setOAOA();
  setUDL();
  setConversions();
  runAppsFlyerAPIs();
  AppsFlyer.initSDK({
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
  });
}

// set a listener
function setConversions() {
  AppsFlyer.addListener(AFConstants.CONVERSION_CALLBACK, event => {
    alert('CONVERSION_CALLBACK ~~>' + JSON.stringify(event));
    if (event.callbackName === AFConstants.onConversionDataSuccess) {
      if (event.data.af_status === 'Non-organic') {
        if (event.data.is_first_launch === true) {
          const deepLinkValue = event.data.deep_link_value;
         handleLink(deepLinkValue);
        }
      }
    }
  });
}

function handleLink(deepLinkValue: string) {
  console.log(deepLinkValue);
}

function setUDL() {
  AppsFlyer.addListener(AFConstants.UDL_CALLBACK, res => {
    alert('UDL_CALLBACK ~~>' + JSON.stringify(res));
    if (res.status === 'FOUND') {
      const deepLinkValue = res.deepLink.deep_link_value;
     handleLink(deepLinkValue);
    } else if (res.status === 'ERROR') {
      console.log('udl error: ' + res.error);
    }
  });


}

// set a listener
function setOAOA() {
  AppsFlyer.addListener(AFConstants.OAOA_CALLBACK, res => {
    alert('OAOA_CALLBACK ~~>' + JSON.stringify(res));
    if (res.callbackName === AFConstants.onAppOpenAttribution) {
      const deepLinkValue = res.data.deep_link_value;
      handleLink(deepLinkValue);
    } else {
      console.log(res.errorMessage);
    }
  });

}

function runAppsFlyerAPIs() {
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
    contains: 'af',
    parameters: {
      is_retargeting: 'true', //Required
      pid: 'cap_app', //Required
      my_param: 'xyz'
    }
  });
  AppsFlyer.setResolveDeepLinkURLs({urls: ['af', 'appsflyer']});
  AppsFlyer.addPushNotificationDeepLinkPath({path: ['af', 'a', 'b']});
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

const App: React.FC = () =>
{
  initAppsFlyer();
  AppTrackingTransparency.requestPermission().then(res => alert('ATT status: ' + res.status));

  return (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/home">
          <Home />
        </Route>
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
)};

export default App;
