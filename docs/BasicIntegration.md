# 🚀 Basic integration of the SDK

####  Set your App ID (iOS only), Dev Key and enable AppsFlyer to detect installations, sessions (app opens) and updates.  
> This is the minimum requirement to start tracking your app installs and is already implemented in this plugin. You **MUST** modify this call and provide:  
 **devKey** - Your application devKey provided by AppsFlyer.<br>
**appID**  - ***For iOS only.*** Your AppStore Application ID.<br>

SDK 7 uses a manual-start model: `start()` must be called from inside the session-ready callback, not right after `init()`. Request ATT permission yourself from inside that same callback, before calling `start()` (see [`AdvancedAPI.md`](AdvancedAPI.md#collect)).

Add the following lines to your code to be able to initialize tracking with your own AppsFlyer dev key:


```typescript
import { AppsFlyer } from 'appsflyer-capacitor-plugin';

export class HomePage {
  constructor(public platform: Platform) {

    this.platform.ready().then(async () => {
      await AppsFlyer.init({
        appId: '1234567890', // replace with your app ID.
        devKey: 'your_dev_key', // replace with your dev key.
      });
      await AppsFlyer.enableDebug({ enabled: true });

      AppsFlyer.registerSessionReadyListener(() => {
        AppsFlyer.start();
      });
    });
  }
}
```
| Setting  | Description   |
| -------- | ------------- |
| devKey   | Your application [devKey](https://support.appsflyer.com/hc/en-us/articles/207032126#integration-2-integrating-the-sdk) provided by AppsFlyer (required)  |
| appId      | Your App Store application ID  (iOS only)  |

Enabling debug logging, deferring the ATT prompt, and registering conversion/deep-link listeners are now separate calls instead of `init()` options — see [`MIGRATION.md`](../MIGRATION.md) for the full list of what moved where.
