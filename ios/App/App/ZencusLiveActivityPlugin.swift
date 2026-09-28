import Foundation
import Capacitor
#if canImport(ActivityKit)
import ActivityKit
#endif

/// Bridges the web timer to an iOS Live Activity (Dynamic Island + Lock Screen).
/// JS: registerPlugin('ZencusLiveActivity') → start / update / end / isAvailable.
@objc(ZencusLiveActivityPlugin)
public class ZencusLiveActivityPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ZencusLiveActivityPlugin"
    public let jsName = "ZencusLiveActivity"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "update", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "end", returnType: CAPPluginReturnPromise),
    ]

    @objc func isAvailable(_ call: CAPPluginCall) {
        if #available(iOS 16.2, *) {
            call.resolve(["available": ActivityAuthorizationInfo().areActivitiesEnabled])
        } else {
            call.resolve(["available": false])
        }
    }

    @objc func start(_ call: CAPPluginCall) {
        guard #available(iOS 16.2, *) else { return call.resolve(["started": false]) }
        let state = Self.state(from: call)
        let attributes = FocusActivityAttributes(taskTitle: call.getString("taskTitle") ?? "")
        Task {
            // one session at a time: replace anything left over
            for activity in Activity<FocusActivityAttributes>.activities {
                await activity.end(nil, dismissalPolicy: .immediate)
            }
            do {
                _ = try Activity.request(
                    attributes: attributes,
                    content: ActivityContent(state: state, staleDate: state.isRunning ? state.endDate : nil),
                    pushType: nil
                )
                call.resolve(["started": true])
            } catch {
                NSLog("[ZencusIsland] request failed: %@", String(describing: error))
                call.reject("Could not start the Live Activity: \(error.localizedDescription)")
            }
        }
    }

    @objc func update(_ call: CAPPluginCall) {
        guard #available(iOS 16.2, *) else { return call.resolve() }
        let state = Self.state(from: call)
        Task {
            for activity in Activity<FocusActivityAttributes>.activities {
                await activity.update(ActivityContent(state: state, staleDate: state.isRunning ? state.endDate : nil))
            }
            call.resolve()
        }
    }

    @objc func end(_ call: CAPPluginCall) {
        guard #available(iOS 16.2, *) else { return call.resolve() }
        Task {
            for activity in Activity<FocusActivityAttributes>.activities {
                await activity.end(nil, dismissalPolicy: .immediate)
            }
            call.resolve()
        }
    }

    @available(iOS 16.2, *)
    private static func state(from call: CAPPluginCall) -> FocusActivityAttributes.ContentState {
        var remaining = max(0, call.getInt("remaining") ?? 0)
        var endDate = Date().addingTimeInterval(TimeInterval(remaining))
        // Running sessions send the app's own end time, so both clocks hit zero together.
        if let endsAt = call.getDouble("endsAt"), endsAt > 0 {
            endDate = Date(timeIntervalSince1970: endsAt / 1000)
            remaining = max(0, Int(endDate.timeIntervalSinceNow.rounded(.up)))
        }
        return FocusActivityAttributes.ContentState(
            mode: call.getString("mode") ?? "work",
            endDate: endDate,
            isRunning: call.getBool("isRunning") ?? true,
            remaining: remaining,
            total: max(1, call.getInt("total") ?? remaining)
        )
    }
}
