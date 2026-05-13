import Foundation
import Capacitor

/// In-app Capacitor plugin for the QA test app. Writes every `[AF_QA]` line
/// to NSLog AND appends to `<sandbox>/Documents/af_qa_logs.txt` so the scenario
/// runner can pick it up from the simulator filesystem. Android relies on
/// `adb logcat` and an analogous Java plugin for the file path.
@objc(AfQaLogger)
public class AfQaLogger: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AfQaLogger"
    public let jsName = "AfQaLogger"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "log", returnType: CAPPluginReturnPromise)
    ]

    private static let logFileName = "af_qa_logs.txt"
    private let writeQueue = DispatchQueue(label: "com.appsflyer.qa.capacitor.AfQaLogger")

    @objc func log(_ call: CAPPluginCall) {
        guard let msg = call.getString("msg") else {
            call.reject("msg is required")
            return
        }
        NSLog("%@", msg)
        writeQueue.async { [weak self] in
            self?.appendToFile(line: msg)
        }
        call.resolve()
    }

    private func appendToFile(line: String) {
        guard let docsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
            return
        }
        let fileURL = docsURL.appendingPathComponent(AfQaLogger.logFileName)
        let payload = line.hasSuffix("\n") ? line : (line + "\n")
        guard let data = payload.data(using: .utf8) else { return }

        if FileManager.default.fileExists(atPath: fileURL.path) {
            if let handle = try? FileHandle(forWritingTo: fileURL) {
                defer { try? handle.close() }
                handle.seekToEndOfFile()
                handle.write(data)
            }
        } else {
            try? data.write(to: fileURL, options: [.atomic])
        }
    }
}
