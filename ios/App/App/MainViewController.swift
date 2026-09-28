import UIKit
import Capacitor

/// The app's web view controller: Capacitor's, plus Zencus's own native plugins.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(ZencusLiveActivityPlugin())
    }
}
