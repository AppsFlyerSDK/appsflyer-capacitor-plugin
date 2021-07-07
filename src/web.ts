import { WebPlugin } from '@capacitor/core';

import type { AppsFlyerPluginPlugin } from './definitions';

export class AppsFlyerPluginWeb extends WebPlugin implements AppsFlyerPluginPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
