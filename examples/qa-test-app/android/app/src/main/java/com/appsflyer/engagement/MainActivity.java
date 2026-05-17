package com.appsflyer.engagement;

import android.content.Intent;
import android.os.Bundle;

import com.appsflyer.AppsFlyerLib;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AfQaLoggerPlugin.class);
        super.onCreate(savedInstanceState);
    }

    /**
     * CI headless emulators can miss the warm-resume intent path; {@code performOnDeepLinking}
     * SDK dedup avoids double delivery when lifecycle also runs.
     */
    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        if (intent != null
                && Intent.ACTION_VIEW.equals(intent.getAction())
                && intent.getData() != null) {
            AppsFlyerLib.getInstance().performOnDeepLinking(intent, getApplication());
        }
    }
}
