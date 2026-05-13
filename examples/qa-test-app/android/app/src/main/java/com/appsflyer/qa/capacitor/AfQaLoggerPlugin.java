package com.appsflyer.qa.capacitor;

import android.util.Log;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * In-app Capacitor plugin for the QA test app. Mirrors AfQaLogger.swift on
 * iOS: writes every [AF_QA] line to logcat AND appends to
 * <code>files/af_qa_logs.txt</code> in the app's internal storage so the
 * scenario runner can pull it via <code>run-as &lt;package&gt; cat ...</code>.
 */
@CapacitorPlugin(name = "AfQaLogger")
public class AfQaLoggerPlugin extends Plugin {
    private static final String TAG = "AF_QA";
    private static final String LOG_FILE_NAME = "af_qa_logs.txt";
    private final Object writeLock = new Object();

    @PluginMethod
    public void log(PluginCall call) {
        String msg = call.getString("msg");
        if (msg == null) {
            call.reject("msg is required");
            return;
        }
        Log.i(TAG, msg);
        appendToFile(msg);
        call.resolve();
    }

    private void appendToFile(String line) {
        File dir = getContext().getFilesDir();
        if (dir == null) {
            return;
        }
        File logFile = new File(dir, LOG_FILE_NAME);
        String payload = line.endsWith("\n") ? line : (line + "\n");
        synchronized (writeLock) {
            try (FileOutputStream out = new FileOutputStream(logFile, true)) {
                out.write(payload.getBytes(StandardCharsets.UTF_8));
            } catch (IOException e) {
                Log.w(TAG, "AfQaLoggerPlugin: failed to append log line", e);
            }
        }
    }
}
