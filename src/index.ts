import { AppsFlyerSDK } from '@appsflyer-sdk/js-core-plugin';

import { CapacitorTransport } from './capacitor-transport';
import { version } from './version';

// Re-exports every RPC method's param/return types and the RpcTransport/RpcEvent contract.
export * from '@appsflyer-sdk/js-core-plugin';
// js-core-plugin does not export AFPurchaseType/MediationNetwork equivalents (Task 1 finding).
export * from './constants';

export interface SetOaidDataOptions {
  oaid: string;
}

class AppsFlyerCapacitorSDK extends AppsFlyerSDK {
  constructor(private readonly capacitorTransport: CapacitorTransport) {
    super(capacitorTransport, {
      plugin: 'capacitor',
      pluginVersion: version,
    });
  }

  setOaidData(options: SetOaidDataOptions): Promise<void> {
    return this.capacitorTransport.setOaidData(options);
  }
}

const AppsFlyer = new AppsFlyerCapacitorSDK(new CapacitorTransport());

export { AppsFlyer };
export default AppsFlyer;
