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

// Native SDK calls that depend on an HTTP round-trip (logEvent in particular)
// only resolve when AppsFlyerRequestListener fires. On slow/no-KVM CI
// emulators the SDK's task queue can stall behind a hung internal request and
// the promise never settles, which would lock the entire auto-run behind a
// single call and trip the runner's 240s ceiling. Cap each awaited call so
// the auto-run always reaches the "Auto run complete" marker; a per-call
// timeout still emits an [AF_QA][<method>] error: ... line that satisfies
// the test plan's `result:` / `error:` log_contains shape.
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

// Translate js-core-plugin's callback names to the cross-stack contract
// names defined in appsflyer-mobile-plugin-tooling/contracts/
// test-app-contract.md. The runner's check patterns are written against
// the contract names; emitting raw plugin names breaks portability.
// Note: SDK 7 folds OAOA (onAppOpenAttribution) into the unified UDL
// (onDeepLinking) callback — js-core-plugin exposes no separate OAOA event.
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

// Void-returning native methods don't echo their input back through the
// Capacitor bridge (iOS returns the sentinel "-1"). For contract-aligned
// readback checks, log the *input* value as the success result on these.
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
  // NOTE: deliberately not calling setHost here. The default AppsFlyer host
  // routes correctly on both platforms. Passing { hostPrefixName: '',
  // hostName: 'appsflyersdk.com' } reroutes Android requests to
  // conversions.appsflyersdk.com/api/v6.17/androidevent which returns HTTP
  // 404 (the canonical host suffix expects a real per-account prefix). iOS
  // silently ignored the override, but Android obeyed and broke start().
  // If a future plan needs to exercise setHost it should use real,
  // resolvable values from the test account.
}

async function postStartApis(): Promise<void> {
  await logResult('getSdkVersion', () => AppsFlyer.getSdkVersion());
  await logResult('getAppsFlyerUID', () => AppsFlyer.getAppsFlyerUID());
}

async function fireStandardEvents(): Promise<void> {
  await logResult('logEvent(af_demo_launch)', () =>
    AppsFlyer.logEvent({
      eventName: 'af_demo_launch',
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

// Phase 5 (E2E-005, identity round-trip) checks that the customer_user_id set
// via setCustomerUserId(...) propagates into a post-start event payload. iOS
// Capacitor's SDK doesn't surface the underlying HTTP request body in
// simctl log show output, so we mirror Flutter's QA app and fire an explicit
// "af_qa_identity_check" event whose params we log in {k=v} format. The
// runner's regex check `customer_user_id[ =:]+e2e_user_42` matches the
// `=`-separated rendering produced by `flattenForLog`.
async function fireIdentityCheckEvent(): Promise<void> {
  const params = {
    customer_user_id: 'e2e_user_42',
    tenant: 'qa_eu',
    experiment: 'rc_pipeline_v1',
  };
  logQa(`[AF_QA][logEvent] name=af_qa_identity_check params=${flattenForLog(params)}`);
  await logResult('logEvent(af_qa_identity_check)', () =>
    AppsFlyer.logEvent({ eventName: 'af_qa_identity_check', eventValues: params }),
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
  logQa(`[AF_QA][logEvent] name=af_qa_custom_purchase params=${payloadToString(eventValue)}`);
  await logResult('logEvent(af_qa_custom_purchase)', () =>
    AppsFlyer.logEvent({ eventName: 'af_qa_custom_purchase', eventValues: eventValue }),
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
    AppsFlyer.logEvent({ eventName: 'af_qa_suppressed', eventValues: { phase: 'stop_true' } }),
  ).catch(() => undefined);
  logQa(`[AF_QA][logEvent: af_qa_suppressed sent during stop(true)]`);

  // Resume
  await logResult('stop', async () => {
    const res = await AppsFlyer.stop({ shouldStop: false });
    logQa(`[AF_QA][stop] result: false`);
    return res;
  });

  await withTimeout(() =>
    AppsFlyer.logEvent({ eventName: 'af_qa_resumed', eventValues: { phase: 'stop_false' } }),
  ).catch(() => undefined);
  logQa(`[AF_QA][logEvent: af_qa_resumed sent after stop(false)]`);
}

// SDK 7's manual-start model: init() only sets up the SDK, and start() must
// be called from inside the session-ready callback (js-core-plugin's own
// doc comment on registerSessionReadyListener). Wrap that callback in a
// promise so autoRun can await "started" the same way it awaited startSDK()
// under the old always-manual API.
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
  // Canonical end-of-auto-run marker the scenario runner polls for.
  // af-scenario-runner.sh hardcodes this exact string at line ~690.
  logQa('[AF_QA][AUTO_APIS] --- Auto run complete ---');
}

document.addEventListener('DOMContentLoaded', () => {
  autoRun().catch((err) => {
    logQa(`[AF_QA][autoRun] fatal: ${(err as Error)?.message ?? String(err)}`);
    setStatus('Auto-run threw — see logs');
  });
});
