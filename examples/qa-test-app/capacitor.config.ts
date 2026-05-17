import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Aligned with the test dev key's registered Android application id
  // and iOS bundle id. The contract's `com.appsflyer.qa.<plugin>` shape is
  // a recommendation; for existing dev keys already wired to
  // `com.appsflyer.engagement` (Flutter QA test app), the contract
  // explicitly allows reusing that id.
  appId: 'com.appsflyer.engagement',
  appName: 'AppsFlyer QA',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
