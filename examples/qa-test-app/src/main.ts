import { AppsFlyer } from 'appsflyer-capacitor-plugin';

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

// HTTP-dependent calls (e.g. logEvent) can stall on slow/no-KVM CI emulators and never settle, locking the whole auto-run — cap each call so it always reaches the "Auto run complete" marker.
const DEFAULT_OP_TIMEOUT_MS = 30000;

function withTimeout<T>(op: () => Promise<T>, timeoutMs = DEFAULT_OP_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout after ${timeoutMs}ms`)), timeoutMs);
    op().then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

async function logResult<T>(method: string, op: () => Promise<T>): Promise<T | undefined> {
  try {
    const result = await withTimeout(op);
    logQa(`[AF_QA][${method}] result: ${payloadToString(result)}`);
    return result;
  } catch (err) {
    logQa(`[AF_QA][${method}] error: ${(err as Error)?.message ?? String(err)}`);
    return undefined;
  }
}

// Translate js-core-plugin's callback names to the cross-stack contract names in appsflyer-mobile-plugin-tooling/contracts/test-app-contract.md — the runner's checks are written against those, not raw plugin names.
async function registerCallbacks(): Promise<void> {
  await AppsFlyer.registerConversionListener({
    onConversionDataSuccess: (data) => {
      const flat = flattenForLog(data);
      logQa(`[AF_QA][CALLBACK][onInstallConversionData] received: ${flat}`);
    },
    onConversionDataFail: (error) => {
      const flat = flattenForLog(error);
      logQa(`[AF_QA][CALLBACK][onInstallConversionDataLoadFailure] received: ${flat}`);
    },
  });

  await AppsFlyer.registerDeepLinkListener({
    onDeepLinking: (data) => {
      const status = data.status ?? 'UNKNOWN';
      const deepLink = data.deepLink ?? {};
      const deepLinkValue = (deepLink as any).deep_link_value ?? (deepLink as any).deepLinkValue ?? '';
      const flatPayload = flattenForLog({ status, deepLink });
      logQa(
        `[AF_QA][CALLBACK][onDeepLinking] received: status=Status.${status}, deepLinkValue=${deepLinkValue}, payload=${flatPayload}`,
      );
    },
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

// Void-returning native methods don't echo their input back (iOS returns the sentinel "-1"), so log the *input* value as the success result for contract-aligned readback checks.
async function logVoidWithReadback<T>(
  method: string,
  readback: string,
  op: () => Promise<T>,
): Promise<void> {
  try {
    await op();
    logQa(`[AF_QA][${method}] result: ${readback}`);
  } catch (err) {
    logQa(`[AF_QA][${method}] error: ${(err as Error)?.message ?? String(err)}`);
  }
}

async function preStartApis(): Promise<void> {
  await logVoidWithReadback('setCustomerUserId', 'e2e_user_42', () =>
    AppsFlyer.setCustomerUserId({ customerId: 'e2e_user_42' }),
  );
  await logVoidWithReadback('setCurrencyCode', 'EUR', () => AppsFlyer.setCurrencyCode({ currencyCode: 'EUR' }));
  const customData = { tenant: 'qa_eu', experiment: 'rc_pipeline_v1' };
  await logVoidWithReadback('setAdditionalData', `keys=[${Object.keys(customData).join(', ')}]`, () =>
    AppsFlyer.setAdditionalData({ customData }),
  );
  // Deliberately not calling setHost: a placeholder prefix ('') breaks Android's start() with an HTTP 404 (iOS silently ignores it) — a future setHost test needs real per-account values.
}

async function postStartApis(): Promise<void> {
  await logResult('getSdkVersion', () => AppsFlyer.getSdkVersion());
  await logResult('getAppsFlyerUID', () => AppsFlyer.getAppsFlyerUID());
}

async function fireStandardEvents(): Promise<void> {
  await logResult('logEvent(qa_demo_launch)', () =>
    AppsFlyer.logEvent({
      eventName: 'qa_demo_launch',
      eventValues: { platform: 'capacitor', stage: 'auto_run' },
    }),
  );

  const purchaseRes = await withTimeout(() =>
    AppsFlyer.logEvent({
      eventName: 'af_purchase',
      eventValues: {
        af_revenue: 9.99,
        af_currency: 'USD',
        af_content_id: 'qa_sku_001',
        af_content_type: 'product',
        af_quantity: 1,
      },
    }),
  ).catch((e) => ({ error: (e as Error).message }));
  logQa(`[AF_QA][logEvent: af_purchase sent] result: ${payloadToString(purchaseRes)}`);

  const contentRes = await withTimeout(() =>
    AppsFlyer.logEvent({
      eventName: 'af_content_view',
      eventValues: {
        af_content_id: 'qa_content_001',
        af_content_type: 'page',
      },
    }),
  ).catch((e) => ({ error: (e as Error).message }));
  logQa(`[AF_QA][logEvent: af_content_view sent] result: ${payloadToString(contentRes)}`);
}

// iOS doesn't surface the HTTP request body in simctl logs, so fire an explicit "qa_identity_check" event logged in {k=v} format for the E2E-005 identity round-trip check (regex: `customer_user_id[ =:]+e2e_user_42`).
async function fireIdentityCheckEvent(): Promise<void> {
  const params = {
    customer_user_id: 'e2e_user_42',
    tenant: 'qa_eu',
    experiment: 'rc_pipeline_v1',
  };
  logQa(`[AF_QA][logEvent] name=qa_identity_check params=${flattenForLog(params)}`);
  await logResult('logEvent(qa_identity_check)', () =>
    AppsFlyer.logEvent({ eventName: 'qa_identity_check', eventValues: params }),
  );
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
  logQa(`[AF_QA][logEvent] name=qa_custom_purchase params=${payloadToString(eventValue)}`);
  await logResult('logEvent(qa_custom_purchase)', () =>
    AppsFlyer.logEvent({ eventName: 'qa_custom_purchase', eventValues: eventValue }),
  );
}

async function stopToggleCycle(): Promise<void> {
  await logResult('stop', async () => {
    const res = await AppsFlyer.stop({ shouldStop: true });
    logQa(`[AF_QA][stop] result: true`);
    return res;
  });

  // Event fired while SDK is stopped should NOT produce HTTP traffic
  await withTimeout(() =>
    AppsFlyer.logEvent({ eventName: 'qa_suppressed', eventValues: { phase: 'stop_true' } }),
  ).catch(() => undefined);
  logQa(`[AF_QA][logEvent: qa_suppressed sent during stop(true)]`);

  await logResult('stop', async () => {
    const res = await AppsFlyer.stop({ shouldStop: false });
    logQa(`[AF_QA][stop] result: false`);
    return res;
  });

  await withTimeout(() =>
    AppsFlyer.logEvent({ eventName: 'qa_resumed', eventValues: { phase: 'stop_false' } }),
  ).catch(() => undefined);
  logQa(`[AF_QA][logEvent: qa_resumed sent after stop(false)]`);
}

// SDK 7's manual-start model requires start() to run inside the session-ready callback — wrap it in a promise so autoRun can await it like the old startSDK().
function startAfterSessionReady(): Promise<void> {
  return new Promise((resolve, reject) => {
    AppsFlyer.registerSessionReadyListener(() => {
      AppsFlyer.start().then(resolve, reject);
    }).catch(reject);
  });
}

async function autoRun(): Promise<void> {
  setStatus('Initializing AppsFlyer SDK…');

  const { devKey, appId } = readEnv();
  if (!devKey) {
    logQa('[AF_QA][CONFIG] DEV_KEY missing');
    setStatus('DEV_KEY missing — abort');
    return;
  }

  await registerCallbacks();
  logQa('[AF_QA][AUTO_APIS] callbacks registered');

  await logResult('init', () => AppsFlyer.init({ devKey, appId }));
  await logResult('enableDebug', () => AppsFlyer.enableDebug({ enabled: true }));

  await preStartApis();
  logQa('[AF_QA][AUTO_APIS] --- Pre-start auto APIs complete ---');

  const startRes = await withTimeout(startAfterSessionReady).catch((e) => ({ error: (e as Error).message }));
  if (startRes && (startRes as any).error) {
    logQa(`[AF_QA][start] error: ${(startRes as any).error}`);
    setStatus('SDK failed to start');
    return;
  }
  logQa('[AF_QA][start] result: SUCCESS');

  await postStartApis();
  logQa('[AF_QA][AUTO_APIS] --- Post-start auto APIs complete ---');

  await fireStandardEvents();
  await fireCustomEventWithParams();
  await fireIdentityCheckEvent();
  await stopToggleCycle();

  setStatus('Auto-run complete. SDK ready for scenario triggers.');
  // Canonical end-of-auto-run marker af-scenario-runner.sh polls for (hardcoded at line ~690).
  logQa('[AF_QA][AUTO_APIS] --- Auto run complete ---');
}

document.addEventListener('DOMContentLoaded', () => {
  autoRun().catch((err) => {
    logQa(`[AF_QA][autoRun] fatal: ${(err as Error)?.message ?? String(err)}`);
    setStatus('Auto-run threw — see logs');
  });
});
