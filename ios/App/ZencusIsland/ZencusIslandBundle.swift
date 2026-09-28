import WidgetKit
import SwiftUI

@main
struct ZencusIslandBundle: WidgetBundle {
    var body: some Widget {
        if #available(iOS 16.2, *) {
            FocusLiveActivity()
        }
    }
}
