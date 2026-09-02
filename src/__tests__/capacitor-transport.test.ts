import { Capacitor } from '@capacitor/core';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { AppsFlyerRpcError, CapacitorTransport } from '../capacitor-transport';

const { executeRpc, addListener } = vi.hoisted(() => ({
  executeRpc: vi.fn(),
  addListener: vi.fn(),
}));

// vi.mock is hoisted above all imports by Vitest, regardless of where it's written in the file.
vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: () => 'android' },
  registerPlugin: () => ({ executeRpc, addListener }),
}));

describe('CapacitorTransport', () => {
  beforeEach(() => {
    executeRpc.mockReset();
    addListener.mockReset();
  });

  it('reports the Capacitor platform', () => {
    const transport = new CapacitorTransport();
    expect(transport.platform).toBe('android');
  });

  it('does not throw on construction when Capacitor.getPlatform() returns web', () => {
    // Construction must never fail: `AppsFlyer` is a module-level singleton (index.ts), so throwing here would crash on import for any app that also builds a web target.
    const platformSpy = vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('web');
    const transport = new CapacitorTransport();
    expect(transport.platform).toBe('web');
    platformSpy.mockRestore();
  });

  it('serializes method+params and resolves data on success', async () => {
    executeRpc.mockResolvedValue({
      responseJson: JSON.stringify({ success: true, data: { uid: 'abc' } }),
    });
    const transport = new CapacitorTransport();

    const result = await transport.call('getAppsFlyerUID', {});

    expect(executeRpc).toHaveBeenCalledWith({
      requestJson: JSON.stringify({ method: 'getAppsFlyerUID', params: {} }),
    });
    expect(result).toEqual({ uid: 'abc' });
  });

  it('rejects with an AppsFlyerRpcError on failure', async () => {
    executeRpc.mockResolvedValue({
      responseJson: JSON.stringify({
        success: false,
        error: { code: 500, message: 'boom' },
      }),
    });
    const transport = new CapacitorTransport();

    await expect(transport.call('start')).rejects.toMatchObject(new AppsFlyerRpcError(500, 'boom'));
  });

  it('rejects with a clear error on malformed native response JSON', async () => {
    executeRpc.mockResolvedValue({ responseJson: 'not json' });
    const transport = new CapacitorTransport();

    await expect(transport.call('start')).rejects.toThrow(/Malformed RPC response/);
  });

  it('subscribe parses the envelope JSON and forwards RpcEvent objects', () => {
    let capturedCallback: ((data: { envelopeJson: string }) => void) | undefined;
    addListener.mockImplementation((_name: string, cb: typeof capturedCallback) => {
      capturedCallback = cb;
      return Promise.resolve({ remove: vi.fn() });
    });
    const transport = new CapacitorTransport();
    const received: unknown[] = [];

    transport.subscribe((event) => received.push(event));
    capturedCallback?.({
      envelopeJson: JSON.stringify({ event: 'onConversionDataSuccess', data: { af_status: 'Organic' } }),
    });

    expect(received).toEqual([{ event: 'onConversionDataSuccess', data: { af_status: 'Organic' } }]);
  });

  it('drops a malformed (non-JSON) rpcEvent payload instead of throwing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    let capturedCallback: ((data: { envelopeJson: string }) => void) | undefined;
    addListener.mockImplementation((_name: string, cb: typeof capturedCallback) => {
      capturedCallback = cb;
      return Promise.resolve({ remove: vi.fn() });
    });
    const transport = new CapacitorTransport();
    const listener = vi.fn();

    transport.subscribe(listener);
    expect(() => capturedCallback?.({ envelopeJson: 'not json' })).not.toThrow();

    expect(listener).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Malformed rpcEvent payload'));
    warnSpy.mockRestore();
  });

  it('drops a well-formed JSON payload missing the required event field', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    let capturedCallback: ((data: { envelopeJson: string }) => void) | undefined;
    addListener.mockImplementation((_name: string, cb: typeof capturedCallback) => {
      capturedCallback = cb;
      return Promise.resolve({ remove: vi.fn() });
    });
    const transport = new CapacitorTransport();
    const listener = vi.fn();

    transport.subscribe(listener);
    capturedCallback?.({ envelopeJson: JSON.stringify({ data: { af_status: 'Organic' } }) });

    expect(listener).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Malformed rpcEvent payload'));
    warnSpy.mockRestore();
  });

  it('remove() unregisters the underlying native listener', async () => {
    const removeSpy = vi.fn();
    addListener.mockResolvedValue({ remove: removeSpy });
    const transport = new CapacitorTransport();

    const handle = transport.subscribe(() => undefined);
    handle.remove();
    await Promise.resolve();

    expect(removeSpy).toHaveBeenCalled();
  });

  it('ignores a second subscribe() on the same instance instead of double-registering', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    addListener.mockResolvedValue({ remove: vi.fn() });
    const transport = new CapacitorTransport();

    transport.subscribe(() => undefined);
    transport.subscribe(() => undefined);

    expect(addListener).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('subscribe() called more than once'));
    warnSpy.mockRestore();
  });

  it('allows re-subscribing after remove()', async () => {
    addListener.mockResolvedValue({ remove: vi.fn() });
    const transport = new CapacitorTransport();

    const handle = transport.subscribe(() => undefined);
    handle.remove();
    await Promise.resolve();
    transport.subscribe(() => undefined);

    expect(addListener).toHaveBeenCalledTimes(2);
  });
});
