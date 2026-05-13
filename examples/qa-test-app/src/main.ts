import { AFConstants, AppsFlyer } from 'appsflyer-capacitor-plugin';

import { logQa } from './af-qa-logger';

const STATUS_EL_ID = 'status';

function setStatus(text: string): void {
  const el = document.getElementById(STATUS_EL_ID);
  if (el) {
    el.textContent = text;
  }
}

function readEnv(): { devKey: string; appId: string } {
  const env = (import.meta as any).env || {};
  const devKey = env.DEV_KEY || env.VITE_DEV_KEY || '';
  const appId = env.APP_ID || env.VITE_APP_ID || '';
  return { devKey, appId };
}

function payloadToString(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

async function logResult<T>(method: string, op: () => Promise<T>): Promise<T | undefined> {
  try {
    const result = await op();
    logQa(`[AF_QA][${method}] result: ${payloadToString(result)}`);
    return result;
  } catch (err) {
    logQa(`[AF_QA][${method}] error: ${(err as Error)?.message ?? String(err)}`);
    return undefined;
  }
}

function registerCallbacks(): void {
  AppsFlyer.addListener(AFConstants.CONVERSION_CALLBACK, (event) => {
    const name = (event as any).callbackName ?? 'conversion_callback';
    const data = (event as any).data ?? (event as any);
    const flat = flattenForLog(data);
    logQa(`[AF_QA][CALLBACK][${name}] received: ${flat}`);
  });

  AppsFlyer.addListener(AFConstants.OAOA_CALLBACK, (event) => {
    const name = (event as any).callbackName ?? 'onAppOpenAttribution';
    const data = (event as any).data ?? (event as any);
    const flat = flattenForLog(data);
    logQa(`[AF_QA][CALLBACK][${name}] received: ${flat}`);
  });

  AppsFlyer.addListener(AFConstants.UDL_CALLBACK, (event) => {
    const status = (event as any).status ?? 'UNKNOWN';
    const deepLink = (event as any).deepLink ?? {};
    const deepLinkValue = deepLink.deep_link_value ?? deepLink.deepLinkValue ?? '';
    const flatPayload = flattenForLog({ status, deepLink });
    logQa(
      `[AF_QA][CALLBACK][onDeepLinking] received: status=Status.${status}, deepLinkValue=${deepLinkValue}, payload=${flatPayload}`,
    );
  });
}

function flattenForLog(value: unknown): string {
  if (value == null) return '';
  if (typeof value !== 'object') return String(value);
  const obj = value as Record<string, unknown>;
  const parts: string[] = [];
  for (const [key, val] of Object.entries(obj)) {
    if (val !== null && typeof val === 'object') {
      parts.push(`${key}=${payloadToString(val)}`);
    } else {
      parts.push(`${key}=${val}`);
    }
  }
  return `{${parts.join(', ')}}`;
}

async function preStartApis(): Promise<void> {
  await logResult('setCustomerUserId', () => AppsFlyer.setCustomerUserId({ cuid: 'e2e_user_42' }));
  await logResult('setCurrencyCode', () => AppsFlyer.setCurrencyCode({ currencyCode: 'EUR' }));
  await logResult('setAdditionalData', () =>
    AppsFlyer.setAdditionalData({
      additionalData: {
        tenant: 'qa_eu',
        experiment: 'rc_pipeline_v1',
      },
    }),
  );
  await logResult('setHost', () => AppsFlyer.setHost({ hostPrefixName: '', hostName: 'appsflyersdk.com' }));
}

async function postStartApis(): Promise<void> {
  await logResult('getSdkVersion', () => AppsFlyer.getSdkVersion());
  await logResult('getAppsFlyerUID', () => AppsFlyer.getAppsFlyerUID());
}

async function fireStandardEvents(): Promise<void> {
  await logResult('logEvent(af_demo_launch)', () =>
    AppsFlyer.logEvent({
      eventName: 'af_demo_launch',
      eventValue: { platform: 'capacitor', stage: 'auto_run' },
    }),
  );

  const purchaseRes = await AppsFlyer.logEvent({
    eventName: 'af_purchase',
    eventValue: {
      af_revenue: 9.99,
      af_currency: 'USD',
      af_content_id: 'qa_sku_001',
      af_content_type: 'product',
      af_quantity: 1,
    },
  }).catch((e) => ({ error: (e as Error).message }));
  logQa(`[AF_QA][logEvent: af_purchase sent] result: ${payloadToString(purchaseRes)}`);

  const contentRes = await AppsFlyer.logEvent({
    eventName: 'af_content_view',
    eventValue: {
      af_content_id: 'qa_content_001',
      af_content_type: 'page',
    },
  }).catch((e) => ({ error: (e as Error).message }));
  logQa(`[AF_QA][logEvent: af_content_view sent] result: ${payloadToString(contentRes)}`);
}

async function fireCustomEventWithParams(): Promise<void> {
  const eventValue = {
    af_revenue: 49.5,
    af_currency: 'EUR',
    af_quantity: 2,
    af_content_id: 'qa_sku_custom_42',
    metadata: {
      tenant: 'qa_eu',
      experiment: 'rc_pipeline_v1',
      tags: ['qa', 'capacitor'],
    },
  };
  logQa(`[AF_QA][logEvent] name=af_qa_custom_purchase params=${payloadToString(eventValue)}`);
  await logResult('logEvent(af_qa_custom_purchase)', () =>
    AppsFlyer.logEvent({ eventName: 'af_qa_custom_purchase', eventValue }),
  );
}

async function stopToggleCycle(): Promise<void> {
  await logResult('stop', async () => {
    const res = await AppsFlyer.stop({ stop: true });
    logQa(`[AF_QA][stop] result: true`);
    return res;
  });

  // Event fired while SDK is stopped should NOT produce HTTP traffic
  await AppsFlyer.logEvent({ eventName: 'af_qa_suppressed', eventValue: { phase: 'stop_true' } }).catch(() => undefined);
  logQa(`[AF_QA][logEvent: af_qa_suppressed sent during stop(true)]`);

  // Resume
  await logResult('stop', async () => {
    const res = await AppsFlyer.stop({ stop: false });
    logQa(`[AF_QA][stop] result: false`);
    return res;
  });

  await AppsFlyer.logEvent({ eventName: 'af_qa_resumed', eventValue: { phase: 'stop_false' } }).catch(() => undefined);
  logQa(`[AF_QA][logEvent: af_qa_resumed sent after stop(false)]`);
}

async function autoRun(): Promise<void> {
  setStatus('Initializing AppsFlyer SDK…');

  const { devKey, appId } = readEnv();
  if (!devKey) {
    logQa('[AF_QA][CONFIG] DEV_KEY missing');
    setStatus('DEV_KEY missing — abort');
    return;
  }

  registerCallbacks();
  logQa('[AF_QA][AUTO_APIS] callbacks registered');

  await logResult('initSDK', () =>
    AppsFlyer.initSDK({
      devKey,
      appID: appId,
      isDebug: true,
      manualStart: true,
      registerConversionListener: true,
      registerOnAppOpenAttribution: true,
      registerOnDeepLink: true,
    }),
  );

  await preStartApis();
  logQa('[AF_QA][AUTO_APIS] --- Pre-start auto APIs complete ---');

  const startRes = await AppsFlyer.startSDK().catch((e) => ({ error: (e as Error).message }));
  if (startRes && (startRes as any).error) {
    logQa(`[AF_QA][startSDK] error: ${(startRes as any).error}`);
    setStatus('SDK failed to start');
    return;
  }
  logQa('[AF_QA][startSDK] result: SUCCESS');

  await postStartApis();
  logQa('[AF_QA][AUTO_APIS] --- Post-start auto APIs complete ---');

  await fireStandardEvents();
  await fireCustomEventWithParams();
  await stopToggleCycle();

  setStatus('Auto-run complete. SDK ready for scenario triggers.');
  logQa('[AF_QA][AUTO_APIS] --- Auto-run cycle complete ---');
}

document.addEventListener('DOMContentLoaded', () => {
  autoRun().catch((err) => {
    logQa(`[AF_QA][autoRun] fatal: ${(err as Error)?.message ?? String(err)}`);
    setStatus('Auto-run threw — see logs');
  });
});
