import ActivityKit
import WidgetKit
import SwiftUI

// Zencus colours
private let scarlet = Color(red: 1.0, green: 0.231, blue: 0.188)      // #FF3B30
private let breakTeal = Color(red: 0.204, green: 0.827, blue: 0.6)     // #34D399
private let ink = Color(red: 0.07, green: 0.07, blue: 0.07)

private func accent(_ mode: String) -> Color { mode == "work" ? scarlet : breakTeal }
private func label(_ mode: String) -> String {
    switch mode {
    case "shortBreak": return "Short break"
    case "longBreak": return "Long break"
    default: return "Focus"
    }
}
private func clock(_ seconds: Int) -> String {
    String(format: "%02d:%02d", max(0, seconds) / 60, max(0, seconds) % 60)
}

/// The Komorebi calico: curled up asleep while you focus, awake in her loaf on a break
/// (the same drawings as the app, from resources/cat-asleep.svg and cat-awake.svg).
struct CatIcon: View {
    let mode: String
    var height: CGFloat
    var body: some View {
        Image(mode == "work" ? "CatAsleep" : "CatAwake")
            .resizable()
            .interpolation(.high)
            .scaledToFit()
            .frame(height: height)
            .accessibilityLabel(mode == "work" ? "Cat sleeping while you focus" : "Cat awake for your break")
    }
}

/// Live countdown when running, a still time when paused.
struct Countdown: View {
    let state: FocusActivityAttributes.ContentState
    var body: some View {
        if state.isRunning {
            Text(timerInterval: Date()...max(Date(), state.endDate), countsDown: true)
                .monospacedDigit()
        } else {
            Text(clock(state.remaining)).monospacedDigit()
        }
    }
}

struct SessionProgress: View {
    let state: FocusActivityAttributes.ContentState
    var body: some View {
        if state.isRunning {
            let start = state.endDate.addingTimeInterval(-TimeInterval(state.total))
            ProgressView(timerInterval: start...max(start.addingTimeInterval(1), state.endDate), countsDown: false) {
                EmptyView()
            } currentValueLabel: {
                EmptyView()
            }
            .tint(accent(state.mode))
        } else {
            ProgressView(value: Double(state.total - state.remaining), total: Double(max(1, state.total)))
                .tint(accent(state.mode))
        }
    }
}

@available(iOS 16.2, *)
struct FocusLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: FocusActivityAttributes.self) { context in
            // Lock Screen / notification banner
            let state = context.state
            HStack(spacing: 14) {
                CatIcon(mode: state.mode, height: 40)
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text(label(state.mode).uppercased())
                            .font(.system(size: 12, weight: .bold, design: .monospaced))
                            .foregroundStyle(accent(state.mode))
                        if !state.isRunning {
                            Text("PAUSED").font(.system(size: 11, weight: .semibold, design: .monospaced)).foregroundStyle(.secondary)
                        }
                        Spacer()
                        Countdown(state: state)
                            .font(.system(size: 26, weight: .bold, design: .monospaced))
                            .foregroundStyle(.white)
                            .multilineTextAlignment(.trailing)
                            .frame(maxWidth: 110, alignment: .trailing)
                    }
                    SessionProgress(state: state)
                    if !context.attributes.taskTitle.isEmpty {
                        Text(context.attributes.taskTitle).font(.footnote).foregroundStyle(.secondary).lineLimit(1)
                    }
                }
            }
            .padding(16)
            .activityBackgroundTint(ink.opacity(0.92))
            .activitySystemActionForegroundColor(.white)

        } dynamicIsland: { context in
            let state = context.state
            return DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 8) {
                        CatIcon(mode: state.mode, height: 30)
                        Text(label(state.mode))
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(accent(state.mode))
                    }
                    .padding(.leading, 4)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Countdown(state: state)
                        .font(.system(size: 28, weight: .bold, design: .monospaced))
                        .multilineTextAlignment(.trailing)
                        .frame(maxWidth: 110, alignment: .trailing)
                        .padding(.trailing, 4)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(alignment: .leading, spacing: 6) {
                        SessionProgress(state: state)
                        HStack {
                            Text(context.attributes.taskTitle.isEmpty ? "Zencus" : context.attributes.taskTitle)
                                .font(.caption).foregroundStyle(.secondary).lineLimit(1)
                            Spacer()
                            if !state.isRunning {
                                Text("Paused").font(.caption.weight(.semibold)).foregroundStyle(.secondary)
                            }
                        }
                    }
                    .padding(.horizontal, 4)
                }
            } compactLeading: {
                CatIcon(mode: state.mode, height: 20)
            } compactTrailing: {
                Countdown(state: state)
                    .font(.system(size: 14, weight: .semibold, design: .monospaced))
                    .foregroundStyle(accent(state.mode))
                    .multilineTextAlignment(.trailing)
                    .frame(width: 48)
            } minimal: {
                CatIcon(mode: state.mode, height: 16)
            }
            .keylineTint(accent(state.mode))
        }
    }
}
