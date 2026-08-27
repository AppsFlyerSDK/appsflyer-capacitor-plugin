import { describe, expect, it, vi, beforeEach } from 'vitest';

const { executeRpc, addListener } = vi.hoisted(() => ({
  executeRpc: vi.fn(),
  addListener: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: () => 'android' },
  registerPlugin: () => ({ executeRpc, addListener }),
}));

// eslint-disable-next-line import/first -- vi.mock must be set up before the mocked module is imported
import { CapacitorTransport } from '../capacitor-transport';

describe('CapacitorTransport', () => {
  beforeEach(() => {
    executeRpc.mockReset();
    addListener.mockReset();
  });

  it('reports the Capacitor platform', () => {
    const transport = new CapacitorTransport();
    expect(transport.platform).toBe('android');
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

  it('rejects with the native error on failure', async () => {
    executeRpc.mockResolvedValue({
      responseJson: JSON.stringify({
        success: false,
        error: { code: 'SDK_ERROR', message: 'boom' },
      }),
    });
    const transport = new CapacitorTransport();

    await expect(transport.call('start')).rejects.toEqual({
      code: 'SDK_ERROR',
      message: 'boom',
    });
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
});
