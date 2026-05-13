package com.appsflyer.qa.capacitor;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AfQaLoggerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
