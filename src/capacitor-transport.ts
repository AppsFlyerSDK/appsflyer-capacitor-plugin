import type { RpcTransport, RpcEvent, ListenerHandle } from '@appsflyer-sdk/js-core-plugin';
import { Capacitor, registerPlugin } from '@capacitor/core';

const RPC_EVENT_NAME = 'rpcEvent';

// The only shape the native side needs to expose — one execute call, one event channel.
// Kept private to this file: it has exactly one caller (CapacitorTransport itself).
interface AppsFlyerNativePlugin {
  executeRpc(options: { requestJson: string }): Promise<{ responseJson: string }>;
  addListener(
    eventName: typeof RPC_EVENT_NAME,
    listenerFunc: (event: { envelopeJson: string }) => void,
  ): Promise<{ remove: () => void }>;
}

const AppsFlyerNative = registerPlugin<AppsFlyerNativePlugin>('AppsFlyerPlugin');

type RpcSuccess<T> = { success: true; data: T };
type RpcFailure = { success: false; error: { code: number | string; message: string } };

export class CapacitorTransport implements RpcTransport {
  readonly platform = Capacitor.getPlatform() as 'ios' | 'android';

  async call<T = void>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    const requestJson = JSON.stringify({ method, params });
    const { responseJson } = await AppsFlyerNative.executeRpc({ requestJson });
    const response = JSON.parse(responseJson) as RpcSuccess<T> | RpcFailure;
    if (!response.success) {
      return Promise.reject(response.error);
    }
    return response.data;
  }

  subscribe(listener: (event: RpcEvent) => void): ListenerHandle {
    const handlePromise = AppsFlyerNative.addListener(RPC_EVENT_NAME, ({ envelopeJson }) => {
      listener(JSON.parse(envelopeJson) as RpcEvent);
    });
    return {
      remove: () => {
        handlePromise.then((handle) => handle.remove());
      },
    };
  }
}
