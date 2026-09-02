import type { RpcTransport, RpcEvent, ListenerHandle } from '@appsflyer-sdk/js-core-plugin';
import { Capacitor, registerPlugin } from '@capacitor/core';

const RPC_EVENT_NAME = 'rpcEvent';

// The only shape the native side needs to expose; kept private since it has one caller (CapacitorTransport).
interface AppsFlyerNativePlugin {
  executeRpc(options: { requestJson: string }): Promise<{ responseJson: string }>;
  addListener(
    eventName: typeof RPC_EVENT_NAME,
    listenerFunc: (event: { envelopeJson: string }) => void,
  ): Promise<{ remove: () => void }>;
}

const AppsFlyerNative = registerPlugin<AppsFlyerNativePlugin>('AppsFlyerPlugin');

type RpcSuccess<T> = { success: true; data: T };
// code is always a number on the wire — both native normalizers emit an Int/number, never a string.
type RpcFailure = { success: false; error: { code: number; message: string } };

export class AppsFlyerRpcError extends Error {
  constructor(
    public readonly code: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppsFlyerRpcError';
  }
}

function isRpcResponse(value: unknown): value is RpcSuccess<unknown> | RpcFailure {
  return typeof value === 'object' && value !== null && typeof (value as { success?: unknown }).success === 'boolean';
}

function isRpcEvent(value: unknown): value is RpcEvent {
  return typeof value === 'object' && value !== null && typeof (value as { event?: unknown }).event === 'string';
}

export class CapacitorTransport implements RpcTransport {
  // RpcTransport requires 'ios' | 'android'; `as` is an intentional type-lie for 'web' — construction must not fail on web since `AppsFlyer` is a module-level singleton (index.ts). Capacitor's own registerPlugin proxy already rejects each call with "not implemented on web".
  readonly platform = Capacitor.getPlatform() as 'ios' | 'android';

  async call<T = void>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    const requestJson = JSON.stringify({ method, params });
    const { responseJson } = await AppsFlyerNative.executeRpc({ requestJson });
    let parsed: unknown;
    try {
      parsed = JSON.parse(responseJson);
    } catch {
      parsed = undefined;
    }
    if (!isRpcResponse(parsed)) {
      throw new Error(`Malformed RPC response for ${method}: ${responseJson}`);
    }
    if (!parsed.success) {
      throw new AppsFlyerRpcError(parsed.error.code, parsed.error.message);
    }
    return (parsed as RpcSuccess<T>).data;
  }

  // Guards against a second native listener: two would each dispatch every RPC event once,
  // double-firing every registered callback (conversion data, deep links, ...). js-core-plugin's
  // own AppsFlyerSDK already calls subscribe() at most once per instance, but this class
  // implements the public RpcTransport interface, so nothing stops a second caller from calling
  // it again on the same transport instance.
  private subscribed = false;

  subscribe(listener: (event: RpcEvent) => void): ListenerHandle {
    if (this.subscribed) {
      // eslint-disable-next-line no-console -- misuse (double subscribe), not debug noise
      console.warn('[AppsFlyer] subscribe() called more than once on the same transport instance — ignoring.');
      return { remove: () => {} };
    }
    this.subscribed = true;

    const handlePromise = AppsFlyerNative.addListener(RPC_EVENT_NAME, ({ envelopeJson }) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(envelopeJson);
      } catch {
        parsed = undefined;
      }
      if (!isRpcEvent(parsed)) {
        // eslint-disable-next-line no-console -- a malformed native event is unexpected but
        // shouldn't crash the listener callback; surface it instead of throwing.
        console.warn(`Malformed rpcEvent payload, dropping: ${envelopeJson}`);
        return;
      }
      listener(parsed);
    });
    return {
      remove: () => {
        this.subscribed = false;
        // eslint-disable-next-line no-console -- addListener rejecting here means the bridge is
        // already gone; nothing meaningful to do but avoid an unhandled rejection.
        handlePromise.then((handle) => handle.remove()).catch((error: unknown) => console.warn(error));
      },
    };
  }
}
