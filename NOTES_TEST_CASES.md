# Notes Page — Test Cases

Every control on the Notes tab (`NotesHub`, `FolderSidebar`, `NoteCard`, `NoteEditorModal`,
`NoteLockModal`, `SketchCanvasModal`). Each case is run end-to-end in Chromium against the
production build (`vite build` + `vite preview`), starting from empty storage unless noted.

**Result key:** PASS · FAIL (bug) · — (not run)

## A. Creating and editing

| ID | Use case | Steps | Expected |
|---|---|---|---|
| A1 | Create a note | New Note → type title + body → Done | Card appears in All + Quick Notes; counts go 0→1 |
| A2 | Note survives reload | A1, reload page | Note still there (localStorage `notes`) |
| A3 | Empty note is not saved | New Note → Done with nothing typed | No card created |
| A4 | Close with X saves | New Note → type → X | Note saved |
| A5 | Esc saves and closes | New Note → type → Esc | Note saved, editor closed |
| A6 | Backdrop click saves | New Note → type → click outside card | Note saved |
| A7 | Ctrl+S saves in place | Type → Ctrl+S | Saved, editor stays open |
| A8 | Autosave | Type, wait 2 s | Saved without closing |
| A9 | Opening a note doesn't change it | Open an old note, wait 2 s, close | `updatedAt` unchanged, order unchanged |
| A10 | Live stats | Type 3 words | Footer shows "3 words" |
| A11 | Status pill truthful | Open a note, touch nothing | Status is not "Editing..." |

## B. Toolbar

| ID | Use case | Expected |
|---|---|---|
| B1–B3 | H1 / H2 / H3 | Line becomes `<h1>` / `<h2>` / `<h3>` |
| B4–B7 | Bold / Italic / Underline / Strikethrough on selected text | `<b>` / `<i>` / `<u>` / `<strike>` |
| B8–B9 | Bullet / numbered list | `<ul>` / `<ol>` inside the editor |
| B10 | Checklist | Checkbox row inserted **inside the editor** |
| B11 | Checklist state persists | Tick box, close, reopen → still ticked |
| B12 | Table | `<table>` inserted |
| B13 | Quote / Code | `<blockquote>` / `<pre>` |
| B14 | Sketch → draw → Embed | Drawing appears in the note |
| B15 | Image upload | Picked image appears in the note |
| B16 | Toolbar with cursor still in title | Formatting lands in the body, not nowhere |

## C. Header controls in the editor

| ID | Use case | Expected |
|---|---|---|
| C1 | Change folder | Note moves to chosen folder |
| C2 | Folder list includes custom folders | Custom folders are selectable |
| C3 | Pick colour | Card gets the colour class after save |
| C4 | Reader preview toggle | Preview shows content; toggling back keeps edits |
| C5 | Set PIN | Lock icon on card, content hidden |
| C6 | Open locked note, wrong PIN | Error, stays locked |
| C7 | Open locked note, right PIN | Editor opens |
| C8 | Remove PIN | Lock gone |
| C9 | Delete from editor | Note goes to Recently Deleted |
| C10 | Turn into Task | Task created with the note title; app switches to Tasks |

## D. Cards

| ID | Use case | Expected |
|---|---|---|
| D1 | Pin / unpin | Moves into / out of Pinned section |
| D2 | Export .md | Downloads `<title>.md` with converted markdown |
| D3 | Export a PIN-locked note | Blocked (or asks for PIN) — must not leak content |
| D4 | Move to Trash | Leaves All, appears in Recently Deleted |
| D5 | Restore | Back in its folder |
| D6 | Delete Forever | Gone from storage (confirm first) |
| D7 | Tag chip on card | Filters list by that tag |

## E. Search, tags, view, sort

| ID | Use case | Expected |
|---|---|---|
| E1 | Search by title | Only matches shown, "N results" line |
| E2 | Search by body text | Matches body, not HTML markup |
| E3 | Clear (X) and Reset | Both clear the search |
| E4 | No results | "No Matching Notes" empty state |
| E5 | Tag pill toggle | Filters; clicking again clears |
| E6 | No false tags | Only real `#tags` appear (not colours/entities) |
| E7 | Grid / List toggle | Layout class switches |
| E8 | Sort Title A–Z / Recent | Order changes correctly |

## F. Folders sidebar

| ID | Use case | Expected |
|---|---|---|
| F1 | Switch folders | Only that folder's notes shown |
| F2 | Folder counts | Match the notes |
| F3 | Header total badge | Equals total number of notes |
| F4 | Add custom folder | Appears under Custom, persists |
| F5 | Cancel add (X) | Form closes, nothing added |
| F6 | New Note inside a custom folder | Note saved into that folder |
| F7 | Duplicate / clashing folder names | Rejected or given unique ids |
| F8 | Delete custom folder | Its notes move to Quick Notes (as the confirm text promises) |
| F9 | Trash view | "New Note" hidden, empty state when empty |

## G. Mobile / keyboard

| ID | Use case | Expected |
|---|---|---|
| G1 | Swipe while drawing a sketch (touch) | Stays on Notes, drawing not lost |
| G2 | App shortcuts while editor open | `F`/`P` don't fire while editing |

---

## First run — 27 Sep 2026 (Chromium, production build)

**52 checks passed, 14 failed.** Failures were each re-run on their own to rule out test timing:
C4 turned out to be a test timing issue and passes; D3 looked like a pass at first but is a real
leak.

### Failed — bugs

| # | Case | Severity | What happens |
|---|---|---|---|
| 1 | C7/C8 | High | Unlocking a note by **typing** the PIN puts the last digit into the title box, replacing the title ("Secret" → "4"). Autosave then keeps the wrong title. |
| 2 | D3 | High | **Export .md** on a PIN-locked card downloads the full note in plain text, with no PIN asked. |
| 3 | F8 | High | Deleting a custom folder doesn't move its notes to Quick Notes, even though the confirm box says it will. Its notes are left with a deleted folder id and only show under All Notes. |
| 4 | B11 | High | Checklist ticks aren't saved. Tick a box, close, reopen: it's unticked. |
| 5 | B16 | Medium | Checklist button while the cursor is in the title inserts the checkbox into the **header**, outside the note. The checkbox is never saved. |
| 6 | A9/A11 | Medium | Just opening a note re-saves it after 1.5 s. That moves it to the top of "Recent" and the footer says "Editing..." when nothing changed. |
| 7 | C2/F6b | Medium | The editor's folder dropdown lists only the 5 built-in folders, so a note can't be moved into a custom folder. For a note already in one, the dropdown wrongly shows "Quick Notes". |
| 8 | F7 | Medium | Folder names aren't checked. "Work" gets id `work` (clashes with built-in Work), and a second "Thesis" duplicates the first. |
| 9 | E6 | Medium | False tags: colour codes in styled text (`#ff3b30`) and HTML entities (`&#39;` → `#39`) show up as tag pills. |
| 10 | F3 | Low | The "Folders" header total counts every note twice (All + its folder); it shows 4 for 2 notes. |
| 11 | D6 | Low | **Delete Forever** deletes with no confirmation. |
| 12 | G2 | Low | With the editor open and focus on a button (e.g. a colour dot), pressing `P` opens the Parking Lot on top and `F` toggles fullscreen. |

### Passed

A1–A8, A10 · B1–B10, B12–B15 · C1, C3–C7, C9, C10 · D1, D2, D4, D5, D7 · E1–E5, E7, E8 ·
F1, F2, F4–F6, F9 · G1 (a right-to-left sketch stroke on a phone doesn't switch tabs).

## After fixes — re-run 27 Sep 2026

**66 / 66 browser checks pass.** Unit tests: 141 pass, including a regression test for each
bug (`NotesWorkflows.test.jsx`, `utils/noteUtils.test.js`).

| # | Fix |
|---|---|
| 1 | The PIN prompt now swallows the digits it reads, so they are never typed into the title. It also starts empty every time it opens. |
| 2 | Export on a locked card asks for the PIN first, then downloads. |
| 3 | Deleting a custom folder moves its notes to Quick Notes. If that folder was open, the view goes back to All Notes. |
| 4 | Ticking a checklist box is written into the note, so it survives saving. |
| 5 | Toolbar actions always land in the note body. If the cursor is elsewhere, it moves to the end of the body first. |
| 6 | Notes are saved only when something actually changed. Opening a note no longer re-orders "Recent". |
| 7 | The editor's folder menu includes custom folders. |
| 8 | New folder names must be unique (built-ins included), and ids never collide. Duplicates get an inline message. |
| 9 | Tags are read from visible text only, and must start with a letter. |
| 10 | The Folders total shows the number of notes. |
| 11 | Delete Forever asks for confirmation. |
| 12 | App shortcuts (`F`, `P`, `D`, `?`) don't fire from inside a dialog. |
| 13 | *Found during the re-run:* a locked note's `#tags` appeared in the tag bar, and search matched its hidden text. Locked notes now expose only their title. |
