export interface AppsFlyerPluginPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
