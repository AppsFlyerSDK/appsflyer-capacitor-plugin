import { describe, expect, it, vi } from 'vitest';

const { AppsFlyerSDKMock } = vi.hoisted(() => ({
  AppsFlyerSDKMock: vi.fn(),
}));

vi.mock('@appsflyer-sdk/js-core-plugin', () => ({
  AppsFlyerSDK: AppsFlyerSDKMock,
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: () => 'android' },
  registerPlugin: () => ({ executeRpc: vi.fn(), addListener: vi.fn() }),
}));

describe('index', () => {
  it('constructs AppsFlyerSDK with a CapacitorTransport and this package’s plugin identity', async () => {
    const { AppsFlyer } = await import('../index');
    const { CapacitorTransport } = await import('../capacitor-transport');
    const pkg = await import('../../package.json');

    expect(AppsFlyerSDKMock).toHaveBeenCalledTimes(1);
    const [transport, identity] = AppsFlyerSDKMock.mock.calls[0];
    expect(transport).toBeInstanceOf(CapacitorTransport);
    expect(identity).toEqual({ plugin: 'capacitor', pluginVersion: pkg.version });
    expect(AppsFlyer).toBeInstanceOf(AppsFlyerSDKMock);
  });

  it('exports the same instance as both the named and default export', async () => {
    const indexModule = await import('../index');
    expect(indexModule.default).toBe(indexModule.AppsFlyer);
  });
});
