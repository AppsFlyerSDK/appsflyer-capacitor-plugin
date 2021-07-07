import { registerPlugin } from '@capacitor/core';

import type { AppsFlyerPluginPlugin } from './definitions';

const AppsFlyerPlugin = registerPlugin<AppsFlyerPluginPlugin>('AppsFlyerPlugin', {
  web: () => import('./web').then(m => new m.AppsFlyerPluginWeb()),
});

export * from './definitions';
export { AppsFlyerPlugin };
