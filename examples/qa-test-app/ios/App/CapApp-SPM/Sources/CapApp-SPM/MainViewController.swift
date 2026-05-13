import Capacitor

/// Custom Capacitor bridge view controller that registers the in-app
/// `AfQaLogger` plugin. The Main.storyboard is configured to instantiate this
/// class so the plugin is available before the JS bundle loads.
public class MainViewController: CAPBridgeViewController {
    public override func capacitorDidLoad() {
        bridge?.registerPluginInstance(AfQaLogger())
    }
}
