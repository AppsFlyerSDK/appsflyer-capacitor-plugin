// Unlike capacitor-transport.test.ts (generic transport, any method name) and index.test.ts (mocks
// js-core-plugin out entirely), this test wires the *real* AppsFlyerSDK + CapacitorTransport
// together — only the native Capacitor bridge call is mocked. That's the only way to actually catch
// a wiring break (wrong param name, wrong platform gate) in js-core-plugin's RPC_MAP for these 3
// new Android-only device-ID setters, added in @appsflyer-sdk/js-core-plugin@7.1.0.
import { AppsFlyerError, AppsFlyerSDK } from '@appsflyer-sdk/js-core-plugin';
import { Capacitor } from '@capacitor/core';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { CapacitorTransport } from '../capacitor-transport';

const { executeRpc } = vi.hoisted(() => ({ executeRpc: vi.fn() }));

// vi.mock is hoisted above all imports by Vitest, regardless of where it's written in the file.
vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: () => 'android' },
  registerPlugin: () => ({ executeRpc, addListener: vi.fn() }),
}));

const DEVICE_ID_SETTERS = [
  { method: 'setImeiData', params: { imei: '490154203237518' } },
  { method: 'setOaidData', params: { oaid: '78c8ea27-widget' } },
  { method: 'setAndroidIdData', params: { androidId: '9774d56d682e549c' } },
] as const;

describe('Android device-ID setters (setImeiData, setOaidData, setAndroidIdData)', () => {
  beforeEach(() => {
    executeRpc.mockReset();
    executeRpc.mockResolvedValue({ responseJson: JSON.stringify({ success: true, data: {} }) });
  });

  it.each(DEVICE_ID_SETTERS)(
    '$method sends its param unchanged to the Android native bridge',
    async ({ method, params }) => {
      const sdk = new AppsFlyerSDK(new CapacitorTransport(), { plugin: 'capacitor', pluginVersion: 'test' });

      await (sdk as unknown as Record<string, (p: unknown) => Promise<void>>)[method](params);

      expect(executeRpc).toHaveBeenCalledWith({ requestJson: JSON.stringify({ method, params }) });
    },
  );

  it.each(DEVICE_ID_SETTERS)('$method is rejected with UNSUPPORTED_ON_PLATFORM on iOS', async ({ method, params }) => {
    const platformSpy = vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('ios');
    const sdk = new AppsFlyerSDK(new CapacitorTransport(), { plugin: 'capacitor', pluginVersion: 'test' });

    await expect(
      (sdk as unknown as Record<string, (p: unknown) => Promise<void>>)[method](params),
    ).rejects.toMatchObject(new AppsFlyerError('UNSUPPORTED_ON_PLATFORM', `${method} is not supported on ios`));
    expect(executeRpc).not.toHaveBeenCalled();

    platformSpy.mockRestore();
  });
});
