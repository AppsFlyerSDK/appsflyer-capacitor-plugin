// Unlike capacitor-transport.test.ts (generic transport, any method name) and index.test.ts (mocks
// js-core-plugin out entirely), this test wires the *real* AppsFlyerSDK + CapacitorTransport
// together — only the native Capacitor bridge call is mocked. That's the only way to actually catch
// a wiring break (wrong param name, wrong platform gate) in js-core-plugin's RPC_MAP for these 3
// new Android-only device-ID setters, added in @appsflyer-sdk/js-core-plugin@7.1.0.
import type { SetAndroidIdDataParams, SetImeiDataParams, SetOaidDataParams } from '@appsflyer-sdk/js-core-plugin';
import { AppsFlyerError, AppsFlyerSDK } from '@appsflyer-sdk/js-core-plugin';
import { Capacitor } from '@capacitor/core';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { AppsFlyerRpcError, CapacitorTransport } from '../capacitor-transport';

const { executeRpc } = vi.hoisted(() => ({ executeRpc: vi.fn() }));

// vi.mock is hoisted above all imports by Vitest, regardless of where it's written in the file.
vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: () => 'android' },
  registerPlugin: () => ({ executeRpc, addListener: vi.fn() }),
}));

type DeviceIdSetterCase =
  | { method: 'setImeiData'; params: SetImeiDataParams }
  | { method: 'setOaidData'; params: SetOaidDataParams }
  | { method: 'setAndroidIdData'; params: SetAndroidIdDataParams };

const DEVICE_ID_SETTERS: readonly DeviceIdSetterCase[] = [
  { method: 'setImeiData', params: { imei: 'REPLACE_WITH_DEVICE_IMEI' } },
  { method: 'setOaidData', params: { oaid: 'REPLACE_WITH_DEVICE_OAID' } },
  { method: 'setAndroidIdData', params: { androidId: 'REPLACE_WITH_ANDROID_ID' } },
];

function callSetter(sdk: AppsFlyerSDK, row: DeviceIdSetterCase): Promise<void> {
  switch (row.method) {
    case 'setImeiData':
      return (sdk as any).setImeiData(row.params);
    case 'setOaidData':
      return (sdk as any).setOaidData(row.params);
    case 'setAndroidIdData':
      return (sdk as any).setAndroidIdData(row.params);
    default: {
      const _exhaustive: never = row;
      return _exhaustive;
    }
  }
}

describe('Android device-ID setters (setImeiData, setOaidData, setAndroidIdData)', () => {
  beforeEach(() => {
    executeRpc.mockReset();
    executeRpc.mockResolvedValue({ responseJson: JSON.stringify({ success: true, data: {} }) });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(DEVICE_ID_SETTERS)('$method sends its param unchanged to the Android native bridge', async (row) => {
    const sdk = new AppsFlyerSDK(new CapacitorTransport(), { plugin: 'capacitor', pluginVersion: 'test' });

    const result = await callSetter(sdk, row);

    expect(executeRpc).toHaveBeenCalledTimes(1);
    const [{ requestJson }] = executeRpc.mock.calls[0];
    expect(JSON.parse(requestJson)).toEqual({ method: row.method, params: row.params });
    expect(result).toBeUndefined();
  });

  it.each(DEVICE_ID_SETTERS)('$method rejects when the native bridge reports failure', async (row) => {
    executeRpc.mockResolvedValue({
      responseJson: JSON.stringify({ success: false, error: { code: 500, message: 'boom' } }),
    });
    const sdk = new AppsFlyerSDK(new CapacitorTransport(), { plugin: 'capacitor', pluginVersion: 'test' });

    await expect(callSetter(sdk, row)).rejects.toMatchObject(new AppsFlyerRpcError(500, 'boom'));
    expect(executeRpc).toHaveBeenCalledTimes(1);
    const [{ requestJson }] = executeRpc.mock.calls[0];
    expect(JSON.parse(requestJson)).toEqual({ method: row.method, params: row.params });
  });

  it.each(DEVICE_ID_SETTERS)('$method rejects when the native bridge returns unparseable responseJson', async (row) => {
    executeRpc.mockResolvedValue({ responseJson: 'not json' });
    const sdk = new AppsFlyerSDK(new CapacitorTransport(), { plugin: 'capacitor', pluginVersion: 'test' });

    // CapacitorTransport.call() can't JSON.parse this, so it throws its own "Malformed RPC
    // response" Error — neither AppsFlyerRpcError nor AppsFlyerError, both of which require a
    // successfully parsed envelope.
    await expect(callSetter(sdk, row)).rejects.toThrow(/Malformed RPC response/);
  });

  it.each(DEVICE_ID_SETTERS)('$method is rejected with UNSUPPORTED_ON_PLATFORM on iOS', async (row) => {
    vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('ios');
    const sdk = new AppsFlyerSDK(new CapacitorTransport(), { plugin: 'capacitor', pluginVersion: 'test' });

    await expect(callSetter(sdk, row)).rejects.toMatchObject(
      new AppsFlyerError('UNSUPPORTED_ON_PLATFORM', `${row.method} is not supported on ios`),
    );
    expect(executeRpc).not.toHaveBeenCalled();
  });

  // NOT the same gate as iOS: RPC_MAP's entries for these 3 methods only declare `android`/`ios`
  // keys (verified in generated/rpc-map.js) — there is no `web` key at all. resolveRpc's
  // `platformRpc === undefined` branch is a *defensive fallback* for map/methods drift, not a
  // web gate, so it silently returns { method, params } unchanged instead of throwing
  // UNSUPPORTED_ON_PLATFORM. In real web builds the call still never reaches native code, because
  // Capacitor's own registerPlugin proxy rejects with "not implemented on web" first — but that
  // happens one layer below resolveRpc, so it's out of reach of this mocked executeRpc and can't
  // be asserted here without unmocking @capacitor/core's registerPlugin.
  it.each(DEVICE_ID_SETTERS)(
    '$method resolves via resolveRpc undefined-platform fallback on web (no web gate, no android mapping applied)',
    async (row) => {
      vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('web');
      const sdk = new AppsFlyerSDK(new CapacitorTransport(), { plugin: 'capacitor', pluginVersion: 'test' });

      const result = await callSetter(sdk, row);

      expect(executeRpc).toHaveBeenCalledTimes(1);
      const [{ requestJson }] = executeRpc.mock.calls[0];
      expect(JSON.parse(requestJson)).toEqual({ method: row.method, params: row.params });
      expect(result).toBeUndefined();
    },
  );
});
