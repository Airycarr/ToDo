# CLAUDE.md: context for AI assistants

Read this before changing the app. It explains how `index.html` is put together, the data it stores, and the conventions to keep.

## What this is

A personal to-do list and planner in **one self-contained HTML file** (`index.html`, about 1,500 lines). There's no framework, no build step and no package manager. The CSS sits in `<style id="css">`, the data in `<script type="application/json" id="state">`, and the code in `<script id="app">`, which is one IIFE written in ES5-style JavaScript (`var`, `function`, no modules).

It runs in two environments, and both must keep working:

1. **A plain browser** (a file or GitHub Pages). Data goes in `localStorage['todo.state.v1']`. The calendar comes from `window.TodoCalendar` in `calendar-adapter.js`, or there is none.
2. **Inside Claude as a claude.ai artifact.** `window.claude.use('artifact')` returns an object whose `publish(html)` saves a new version of the page, so the page saves by rebuilding its own HTML with the current state embedded (`buildDoc()`). With no adapter set, `window.claude.use('mcp')` provides Claude's Google Calendar connector (`list_events` through `watchTool`, `create_event` through `callTool`).

`HOSTED = !!(window.claude && window.claude.use)` decides which one applies. Never assume `window.claude` exists.

## Data model (`S`, the saved state)

```js
S = {
  scratch: "free-text notes box",            // optional
  sections: [{
    id: "inbox", name: "Inbox", desc: "optional section description",
    items: [{
      id: "x…",                 // uid()
      text: "Task title",
      done: false,
      due:  "YYYY-MM-DD",       // optional due date
      plan: "YYYY-MM-DD",       // optional planned day (shown in the planner)
      pord: 0,                  // order within its planned day (setDayOrder)
      pri:  "high"|"med"|"low", // optional priority
      notes: "description",     // optional
      gcal: "YYYY-MM-DD",       // the plan date last pushed to a calendar
      subs: [{ id, text, done }]
    }]
  }]
}
```

Dates are always local `YYYY-MM-DD` strings. Build them with `iso(date)` and read them with `parseD(str)`, never `new Date('YYYY-MM-DD')`, which would read the date as UTC. Calendar events are **never** stored in `S`; they're fetched live into `gcEvents`.

Per-viewer UI preferences go in `localStorage` through `setPref`: `hideDone`, `sortBy`, `pFilter`, `planFilter`, `calMode`. They're kept apart from the data on purpose.

## How the code works

- **Rendering:** `render()` rebuilds the whole DOM from `S` every time. Any change follows the pattern *mutate `S` → `render()` → `schedule()`*. `render()` keeps focus (through `data-key` attributes), scroll position and the week strip's horizontal scroll. Every interactive element needs a unique `data-key` so focus survives re-renders.
- **Saving:** `schedule()` records an undo snapshot (`record()`) and debounces `save()` by 1.2 seconds. `save()` waits while `busy()` (editing or dragging), then publishes inside Claude or calls `saveLocal()` elsewhere. A `visibilitychange` handler flushes pending saves when the tab is hidden.
- **Undo:** `hist` holds up to 60 JSON snapshots. Typing bursts within 1.5 seconds merge into one step. `undo()` restores the previous snapshot and saves with `schedule(true)` so the restore isn't recorded as a new step.
- **Drag and drop:** custom pointer events, not HTML5 drag and drop, so it works on touch screens. `onDown`, `activate`, `place`, `onUp`/`onCancel` and `detach` are driven by `drag.kind`:
  - `item`: a task row. Drops into a section (reorder or move) or onto a `[data-day]` (plans it).
  - `plan`: a task chip in the planner, moved between days or reordered within a day. Month-view chips (`.mchip`) are their own handle; a tap with no movement calls `flashTask`.
  - `sec`: a section, using the grip in its header.
  - `nav`: a section in the left-hand list, which reorders `S.sections`.

  Auto-scroll runs for the window, the week strip and the nav row. A tap without movement opens the keyboard and touch fallbacks (`openMove`, `openPlan`, `openSec`), which show Up/Down and Move buttons.
- **Planner:** `renderCal()` draws day, week or month based on `calMode`, with `dayOffset`, `weekOffset` and `monthOffset`. `dayTasks(ds)` returns a day's tasks sorted by `pord`. `eventsByDay()` maps calendar events (Google-style shape) to days.
- **Calendar:** `gcWatch()` subscribes for the visible range. The priority is `CALX` (`window.TodoCalendar`), then Claude's MCP when `HOSTED`, then nothing (`gcState.status = 'off'`). Adapter events pass through `normEv()` into the Google shape `{summary, htmlLink, start:{date|dateTime}, end:{…}}`. Adding events goes through `bulkPlan(true)`, which the per-task "Add to …" chip also uses by selecting one task. `CALNAME` labels the UI. `calAvailable()` hides calendar buttons when nothing is connected.
- **Filters and sort:** `matches(it)` combines the priority filter (`pFilter`) and the planned-date filter (`planFilter`). `filtering()` reports whether either is active. Sorting happens per section in `render()` and changes only what's displayed, never `S`.
- **Select mode:** `selecting` and `selected{}` drive the bottom action bar: `bulkMove`, `bulkDone`, `bulkPri`, `bulkDelete` and `bulkPlan`.

## Conventions

- **Design tokens:** CSS custom properties on `:root`, redefined for dark mode under `prefers-color-scheme` and `[data-theme="dark"]`. Use the tokens; don't hard-code colours. Gold (`--gold`) marks tasks and the brand, and blue (`--ev*`) marks calendar events.
- **Fonts:** Bricolage Grotesque for headings, Figtree for body text.
- **Layout:** the list column is at most 620px (880px including the left-hand nav), and the calendar uses the full 1040px width. It must work at phone width (about 400px) with a 16px side gutter and no horizontal page scroll. The week strip scrolls sideways on its own.
- **Phone fallbacks:** every drag action must also be possible without dragging.
- **Copy:** plain, friendly English with Australian spelling ("organisation") and `en-AU` dates. Status lines and toasts say what happened. Use the curly apostrophe (`’`) in UI strings.
- **No personal data in the repository:** the embedded `state` must stay as the empty starter (one `Inbox` section).

## Testing

There's no test suite. Changes were checked with Playwright scripts that:
- open `index.html` at 1100px and 400px wide and take screenshots
- mock `window.claude.use` (an `artifact` with `publish()`, and an `mcp` with `watchTool`/`callTool`/`invalidate`) to exercise Claude mode
- route `calendar-adapter.js` to a fake `TodoCalendar` to exercise the adapter path
- run drags with `mouse.down/move/up` in 12 steps

Check that the page shows no `pageerror` after any change.

## Known limits

- Browser storage is per browser and per device, with no sync. Export backup and Import backup are the stopgap.
- Undo history is lost on reload.
- Undo doesn't delete events already added to a calendar.
- On phones the month view shows dots instead of task names. Tasks can still be dropped on dates; to move one already planned, open the day.
