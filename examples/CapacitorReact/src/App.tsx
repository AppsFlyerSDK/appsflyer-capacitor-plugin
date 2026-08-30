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
  await AppsFlyer.init({
    appId: process.env.REACT_APP_AF_APP_ID ?? '',
    devKey: process.env.REACT_APP_AF_DEV_KEY ?? '',
  });
  await setConversions();
  runAppsFlyerAPIs();
  await AppsFlyer.enableDebug({ enabled: true });
  AppsFlyer.registerSessionReadyListener(async () => {
    // Gate only start() on ATT — it's the only call that reads IDFA and transmits.
    const res = await AppTrackingTransparency.requestPermission();
    console.log('ATT status: ' + res.status);
    AppsFlyer.start();
  });
}

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

// SDK 7 folds OAOA (onAppOpenAttribution) into this same UDL callback — no separate OAOA registration exists.
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
  AppsFlyer.setCurrentDeviceLanguage({ language: 'en' }).catch(e => console.log(e));
  AppsFlyer.setAppInviteOneLink({ oneLinkId: 'your_onelink_id' }).then();
  AppsFlyer.setCustomerUserId({ customerId: 'csadadadad' }).catch(e => console.log(e));
  AppsFlyer.setCurrencyCode({ currencyCode: 'ILS' }).catch(e => console.log(e));
  AppsFlyer.updateServerUninstallToken({ token: 'fdsffddfbnjdfoiuvhof' }).catch(e => console.log(e));
  AppsFlyer.setOneLinkCustomDomain({ domains: ['promotion.greatapp.com', 'click.greatapp.com', 'deals.greatapp.com'] }).catch(e => console.log(e));
  AppsFlyer.appendParametersToDeepLinkingURL({
    contains: 'af',
    parameters: {
      is_retargeting: 'true', //Required
      pid: 'cap_app', //Required
      my_param: 'xyz'
    }
  }).catch(e => console.log(e));
  AppsFlyer.setResolveDeepLinkURLs({ urls: ['af', 'appsflyer'] }).catch(e => console.log(e));
  AppsFlyer.addPushNotificationDeepLinkPath({ deepLinkPath: ['af', 'a', 'b'] }).catch(e => console.log(e));
  AppsFlyer.setAdditionalData({
    customData: {
      capacitor: 'plugin',
      apps: 'Flyer'
    }
  }).catch(e => console.log(e));
}

const App: React.FC = () => {
  useEffect(() => {
    initAppsFlyer().catch(e => console.log(e));
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
