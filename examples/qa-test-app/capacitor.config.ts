import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.appsflyer.qa.capacitor',
  appName: 'AppsFlyer QA',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
