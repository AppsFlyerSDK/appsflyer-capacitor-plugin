import { AppsFlyerSDK } from '@appsflyer-sdk/js-core-plugin';

import { CapacitorTransport } from './capacitor-transport';
import { version } from './version';

// Re-exports every RPC method's param/return types and the RpcTransport/RpcEvent contract.
export * from '@appsflyer-sdk/js-core-plugin';
// js-core-plugin does not export AFPurchaseType/MediationNetwork equivalents (Task 1 finding).
export * from './constants';

const AppsFlyer = new AppsFlyerSDK(new CapacitorTransport(), {
  plugin: 'capacitor',
  pluginVersion: version,
});

export { AppsFlyer };
export default AppsFlyer;
