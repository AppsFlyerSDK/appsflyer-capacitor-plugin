# In-App events

In-App Events provide insight on what is happening in your app. It is recommended to take the time and define the events you want to measure to allow you to measure ROI (Return on Investment) and LTV (Lifetime Value).

Recording in-app events is performed by calling `logEvent` with an event name and value parameters.

Find more info about recording events [here](https://support.appsflyer.com/hc/en-us/articles/115005544169-Rich-in-app-events-guide#introduction).

- [Log Event](#log-event)
- [In-app purchase validation](#in-app-purchase-validation)

## Log Event

- **Event name**: The unique event identifier. It is usually how marketers see the event in the dashboard.
- **Event values**: An object that consists of key-value pairs called **event parameters**. Event parameters provide additional context and information about the occurring event.

```typescript
await AppsFlyer.logEvent({
  eventName: 'af_purchase',
  eventValues: {
    af_revenue: 956,
    af_receipt_id: 'id536',
    af_currency: 'USD',
  },
});
```

`logEvent` resolves `Promise<void>` — by default as soon as the SDK queues the event, not once it
reaches AppsFlyer's server. Pass `awaitResponse: true` to instead wait for the native SDK's own
completion handler. See [`docs/API.md#logevent`](API.md#logevent) for the full parameter table.

## In-app purchase validation

AppsFlyer provides a single API for server verification of in-app purchases across both Android
and iOS: `validateAndLogInAppPurchase`. It automatically logs an `af_purchase` event if
validation succeeds — you don't need to send that event yourself.

The `purchase` object's shape differs per platform — Android reports a `purchaseToken`, iOS
reports a `transactionId` — so build the object matching your platform, not a shared shape:

```typescript
import { AppsFlyer, AFPurchaseType } from 'appsflyer-capacitor-plugin';
import { Capacitor } from '@capacitor/core';

const additionalParameters = { revenue: 9.99, currency: 'USD' };

if (Capacitor.getPlatform() === 'ios') {
  await AppsFlyer.validateAndLogInAppPurchase({
    purchase: {
      productId: 'com.example.product',
      transactionId: '2000000569065806',
      purchaseType: AFPurchaseType.oneTimePurchase,
    },
    additionalParameters,
  });
} else {
  await AppsFlyer.validateAndLogInAppPurchase({
    purchase: {
      productId: 'com.example.product',
      purchaseToken: 'purchase-token-from-billing-client',
      purchaseType: AFPurchaseType.oneTimePurchase,
    },
    additionalParameters,
  });
}
```

A 401/500 logged via `console.warn` after calling this means the app isn't registered for
purchase validation on the server side — expected, not a bridge failure.

See [`docs/API.md#validateandloginapppurchase`](API.md#validateandloginapppurchase) for the full
parameter table and `AFPurchaseType` values.
