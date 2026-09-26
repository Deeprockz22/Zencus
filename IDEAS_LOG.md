# Zencus — Improvement Ideas Log

One idea per 30-minute round. Read this before choosing a new one, so no idea is repeated.
Proposals by Antigravity in STEVE_REVIEW_NOTES.md (e.g. the "Cognitive Chromatic Arc",
the "Komorebi" theme) are hers and are not picked up here without coordination.

---

## #1 — Session Debrief (24 Sep 2026, ~19:25)

**Market research**
- **Session** (stayinsession.com) sets an *intention* before each session and prompts a short
  *reflection* after it, building a record of what you worked on and learned.
  Sources: [Session](https://www.stayinsession.com/), [Getting started guide](https://www.stayinsession.com/learn/getting-started-with-session-pomodoro-app),
  [App Store](https://apps.apple.com/us/app/session-pomodoro-focus-timer/id1521432881).
- **Flora** attaches sessions to to-dos and repeating goals; **Forest** and **Opal** focus on blocking;
  **Tide** on calm ambient sound.
  Sources: [Reclaim: best focus apps 2026](https://reclaim.ai/blog/focus-apps),
  [Forest vs Flora](https://nerdynav.com/forest-vs-flora-pomodoro/), [Habi: focus timer apps](https://habi.app/insights/best-focus-timer-apps/).

**The gap in Zencus:** a timer, tasks and a notes vault that never talked to each other after
a session. Finishing a session gave confetti and nothing else.

**The idea (with a twist):** when a focus session ends, a small card asks *What did you get
done?*, *What's next?* and *How do you feel?* (Energised / Steady / Drained / Scattered).
- "Done" + feeling become a **`#focuslog` note** in Quick Notes, stamped
  "Focus · 25 min · <task>". The notes vault turns into a work journal for free.
- "Next" becomes a **task in one tap** (same category as the finished task). The finished session
  feeds the next one: **timer → notes → tasks**, a loop none of the apps above close.
- It never blocks: it sits above the dock, Skip or Escape closes it, and nothing is saved unless
  you write something.

**Built**
- `src/components/timer/SessionDebrief.jsx` (card + `debriefToNote()`), `session-debrief.css`
  (token-based for Crisp; glass for Surreal/Lantern; centred sheet on phones).
- `src/App.jsx`: opens the debrief from `handleSessionComplete` (work sessions only), saves via
  `saveNote` / `addTask`.
- Tests: `src/components/timer/SessionDebrief.test.jsx` (4). Suite 85/85, build ok.
- Verified live with a real completed session (tick sped up in the preview page only): Crisp Light
  desktop and 375px, Surreal day desktop, Surreal night 375px. The saved note and new task were
  checked in storage.

**Try it:** finish any focus session. Or pick the 15 preset, press Start Focus, and wait it out.
