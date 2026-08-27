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
import { useEffect } from 'react';
import { AppsFlyer } from "appsflyer-capacitor-plugin";
import { AppTrackingTransparency } from "capacitor-plugin-app-tracking-transparency";

async function initAppsFlyer() {
  await setUDL();
  await setConversions();
  runAppsFlyerAPIs();
  await AppsFlyer.init({
    appId: process.env.REACT_APP_AF_APP_ID ?? '',
    devKey: process.env.REACT_APP_AF_DEV_KEY ?? '',
  });
  await AppsFlyer.enableDebug({ enabled: true });
  AppsFlyer.registerSessionReadyListener(async () => {
    // Gate only start() on ATT, not init()/listener registration — start() is
    // what reads IDFA and transmits, so it's the only call that needs the wait.
    const res = await AppTrackingTransparency.requestPermission();
    console.log('ATT status: ' + res.status);
    AppsFlyer.start();
  });
}

// set a listener
function setConversions() {
  return AppsFlyer.registerConversionListener({
    onConversionDataSuccess: data => {
      console.log('onConversionDataSuccess ~~>' + JSON.stringify(data));
      if (data.af_status === 'Non-organic' && data.is_first_launch === true) {
        handleLink(data.deep_link_value as string);
      }
    },
    onConversionDataFail: error => {
      console.log(error);
    },
  });
}

function handleLink(deepLinkValue: string) {
  console.log(deepLinkValue);
}

// SDK 7 folds OAOA (onAppOpenAttribution) into this same UDL callback —
// js-core-plugin exposes no separate OAOA registration.
function setUDL() {
  return AppsFlyer.registerDeepLinkListener({
    onDeepLinking: data => {
      console.log('onDeepLinking ~~>' + JSON.stringify(data));
      if (data.status === 'FOUND') {
        const deepLinkValue = (data.deepLink as any)?.deep_link_value;
        handleLink(deepLinkValue);
      } else if (data.status === 'ERROR') {
        console.log('udl error: ' + data.error);
      }
    },
  });
}

function runAppsFlyerAPIs() {
  //AppsFlyer.setHost({hostName:'af',hostPrefixName:'cn'});
  //AppsFlyer.disableAdvertisingIdentifier({shouldDisable:true});
  //AppsFlyer.disableCollectASA({shouldDisable:true});
  //AppsFlyer.disableSKAdNetwork({shouldDisable:true});
  AppsFlyer.setCurrentDeviceLanguage({ language: 'en' }).catch(e => console.log(e));
  AppsFlyer.setAppInviteOneLink({ oneLinkId: 'your_onelink_id' }).then();
  AppsFlyer.setCustomerUserId({ customerId: 'csadadadad' });
  AppsFlyer.setCurrencyCode({ currencyCode: 'ILS' });
  AppsFlyer.updateServerUninstallToken({ token: 'fdsffddfbnjdfoiuvhof' });
  AppsFlyer.setOneLinkCustomDomain({ domains: ['promotion.greatapp.com', 'click.greatapp.com', 'deals.greatapp.com'] });
  AppsFlyer.appendParametersToDeepLinkingURL({
    contains: 'af',
    parameters: {
      is_retargeting: 'true', //Required
      pid: 'cap_app', //Required
      my_param: 'xyz'
    }
  });
  AppsFlyer.setResolveDeepLinkURLs({ urls: ['af', 'appsflyer'] });
  AppsFlyer.addPushNotificationDeepLinkPath({ deepLinkPath: ['af', 'a', 'b'] });
  AppsFlyer.setAdditionalData({
    customData: {
      capacitor: 'plugin',
      apps: 'Flyer'
    }
  });
  //   AppsFlyer.enableFacebookDeferredApplinks({enableFacebookDAL: true})
  //     .then(res => console.log(res.res))
  //     .catch(e => console.log(e));
  //
}

const App: React.FC = () => {
  useEffect(() => {
    initAppsFlyer();
  }, []);

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
  )
};

export default App;
