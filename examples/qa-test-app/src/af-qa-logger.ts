import { registerPlugin } from '@capacitor/core';

interface AfQaLoggerPlugin {
  log(options: { msg: string }): Promise<void>;
}

const AfQaLoggerNative = registerPlugin<AfQaLoggerPlugin>('AfQaLogger', {
  web: {
    log: async (_options: { msg: string }) => {
      // no-op on web
    },
  },
});

export function logQa(msg: string): void {
  // stdout (adb logcat / Xcode console)
  console.log(msg);
  // iOS dual output: file at Documents/af_qa_logs.txt
  AfQaLoggerNative.log({ msg }).catch(() => {
    // logger plugin is best-effort; never throw out of a log call
  });
}
