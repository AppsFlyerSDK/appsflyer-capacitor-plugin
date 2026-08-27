package com.appsflyer.engagement;

import android.content.Intent;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AfQaLoggerPlugin.class);
        super.onCreate(savedInstanceState);
    }

    // SDK 7's af-android-plugin-bridge observes intents via its own
    // Application.ActivityLifecycleCallbacks (registered at init()/start()),
    // so the host Activity just needs to make the new intent visible through
    // getIntent() — no direct AppsFlyerLib call here. Matches the RN plugin's
    // example MainActivity.kt.
    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }
}
