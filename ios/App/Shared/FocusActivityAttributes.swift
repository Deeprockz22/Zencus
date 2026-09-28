import Foundation
#if canImport(ActivityKit)
import ActivityKit

/// What the Zencus Live Activity knows about the running session.
/// Compiled into both the app (which starts/updates it) and the
/// ZencusIsland widget extension (which draws it).
@available(iOS 16.1, *)
public struct FocusActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        /// "work", "shortBreak" or "longBreak"
        public var mode: String
        /// When the running timer reaches zero. iOS counts down to it by itself.
        public var endDate: Date
        /// Paused sessions show a still time instead of a live countdown.
        public var isRunning: Bool
        /// Seconds left at the moment of the last update (used while paused).
        public var remaining: Int
        /// Length of the whole session in seconds (for the progress bar).
        public var total: Int

        public init(mode: String, endDate: Date, isRunning: Bool, remaining: Int, total: Int) {
            self.mode = mode
            self.endDate = endDate
            self.isRunning = isRunning
            self.remaining = remaining
            self.total = total
        }
    }

    /// The task the session is for, if any.
    public var taskTitle: String

    public init(taskTitle: String) {
        self.taskTitle = taskTitle
    }
}
#endif
