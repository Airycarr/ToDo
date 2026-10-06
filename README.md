# To Do

A single-page to-do list and planner. It started as a phone Notes checklist and was built up feature by feature in a conversation with Claude.

Everything is in one file, `index.html`: plain HTML, CSS and JavaScript, with no build step and no dependencies apart from two Google Fonts.

## Features

**Tasks**
- Sections you can add, rename, describe and reorder by dragging
- Tasks with tick-off, inline editing, descriptions, subtasks, due dates and priority (High, Medium or Low)
- Drag tasks between sections or into a new position. On phones, tap the dots for Move, Up and Down buttons.
- Mass edit: select several tasks, then move, complete, set priority, delete or plan them for a date
- Undo button (and Ctrl/Cmd+Z) covering the last 60 changes
- Filter by planned date (Not planned or Planned) and by priority, sort by planned date, due date or priority, and hide completed tasks

**Planner**
- Day, week (Monday to Sunday) and month views
- Drag tasks from the list onto any day, between days and up or down within a day
- "Plan for a date" on every task, with Unplan to remove it
- Overdue and due-soon alerts
- Notes box for quick jottings

**Navigation**
- A section list on the left (a chip row on phones) that jumps to each section and can be dragged to reorder sections

**Calendar (optional)**
- Shows events from a connected calendar inside the planner
- "Add to calendar" for planned tasks, as all-day events or at a chosen time

## Running it

**Easiest:** open `index.html` in a browser. Your list is saved in that browser's local storage.

**As a website:** turn on GitHub Pages (Settings, then Pages, then deploy from the `main` branch, root folder) and open the URL it gives you. You need this for a calendar sign-in such as Outlook.

### Where your data lives

| Where the page runs | How it saves |
|---|---|
| A browser (file or website) | `localStorage` in that browser, under the key `todo.state.v1` |
| Inside Claude, as a claude.ai artifact | The page saves new versions of itself |

Browser storage belongs to that one browser on that one device. Use **Export backup** and **Import backup** at the bottom of the list to move or keep a copy. Clearing site data erases the list.

The repository holds no personal tasks. It starts with an empty **Inbox** section.

## Connecting a calendar

The planner reads events from, and adds events to, whatever `window.TodoCalendar` points to. That is set in `calendar-adapter.js`.

- **Default:** `null`, so no calendar is connected. Tasks still plan onto dates.
- **Outlook / Microsoft 365:** `calendar-adapter.js` contains a ready-made Microsoft Graph example. To turn it on:
  1. Register a single-page app in Microsoft Entra ID with the delegated permission `Calendars.ReadWrite`, and add your site URL as a redirect URI.
  2. Add the MSAL browser script to `index.html`, above the `calendar-adapter.js` tag.
  3. Put your client ID in the example and delete its `return;` line.
  4. Host the site (for example on GitHub Pages). Sign-in doesn't work from a `file://` URL.
- **Any other calendar:** write an object with `name`, `watch(range, onData)` and, optionally, `create(task)`. The full interface is documented at the top of `calendar-adapter.js`.

When the page runs inside Claude and no adapter is set, it uses Claude's Google Calendar connector instead.

## Project files

```
index.html            the whole app (styles, data, code)
calendar-adapter.js   optional calendar connection (Outlook example included)
CLAUDE.md             context for AI assistants: architecture, data model, conventions
docs/FEATURE_HISTORY.md  every feature request, how it was built, and prompts to rebuild it
```

## Notes

- Dates and times are formatted for Australian English (`en-AU`): "Thu, 8 Oct" and Monday-first weeks.
- There's no account system, so each browser keeps its own list.
