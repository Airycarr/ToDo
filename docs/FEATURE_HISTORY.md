# Feature history

The app was built in one long conversation with Claude, one request at a time. Each step below lists the request as it was asked, what was built, and a prompt you can give an AI assistant to rebuild that step. Run the prompts in order on top of `index.html` (or start from an empty file).

The original version was a claude.ai artifact that saved itself. The GitHub version (step 20) added browser saving and a pluggable calendar.

---

### 1. Checklist from phone notes
**Request:** "Can you make this into a checklist" (with screenshots of a notes-app list)
**Built:** a single-page checklist that groups tasks into sections, with tap-to-tick gold circles, a progress bar, "Hide completed", an add box per section, and saving.
**Rebuild prompt:** *Build a single self-contained HTML page that is a to-do checklist. Tasks are grouped into named sections. Each task has a round tick button. Show a progress bar and "X of Y done", a "Hide completed" toggle, and an "Add to <section>" input under each section. Keep the data as JSON in a `<script type="application/json" id="state">` block and re-render the whole list from it after every change. Use a calm neutral palette with gold as the accent, and support dark mode.*

### 2. Due dates
**Request:** "Give me a section where i can add the due date"
**Built:** a due-date chip on each task (with a native date picker underneath) showing "Due today", "Due tomorrow", "Overdue · …" or "Due Thu, 8 Oct", plus Clear, header alerts for overdue and due-this-week tasks, and a "Sort by due date" option.
**Rebuild prompt:** *Add an optional due date to each task as a pill-shaped chip with an invisible date input on top. Colour it by urgency (overdue, due within 2 days, later), add a Clear link, show "N overdue" and "N due in the next 7 days" alerts in the header, and add a sort option for due date.*

### 3. Move tasks and rename headings
**Request:** "Can you make it so im able to move each task freely between the sub headings and also change the heading"
**Built:** pointer-event drag and drop using a dotted grip on each task (it works on touch screens, unlike HTML5 drag and drop), with a ghost and a placeholder. Tapping the grip opens Move to, Up and Down controls. Section names can be edited in place.
**Rebuild prompt:** *Let me drag tasks by a 6-dot grip, using pointer events (not HTML5 drag and drop), into any position in any section, with a floating ghost, a dashed placeholder and window auto-scroll near the edges. Tapping the grip without dragging opens a row with a "Move to" section dropdown and Up/Down buttons for phones. Make section headings editable by tapping them.*

### 4. Edit tasks, reorder sections, subtasks
**Request:** "1. Give the option to edit the task once it's been added to the to do list 2. Give the option to drag section order 3. Give the option to add sub tasks under the task"
**Built:** tap a task's text to edit it in place, drag sections by a grip in their header (with an Up/Down fallback), and add subtasks with their own ticks, a count ("1/3") and delete buttons.

### 5. Weekly planner
**Request:** "Add a calendar preview for the current week commencing (Monday i.e. 5th October) at the top of the page, where I can drag and drop tasks into each day."
**Built:** a Monday-to-Sunday strip with today highlighted. Dropping a task on a day sets `plan`. Day cards show planned-task chips (tick, remove) and a "N due" flag. Previous/next week navigation, plus a "Plan for" dropdown in the task's move row.

### 6. Priority filter and task descriptions
**Request:** "1. Add the option where I can filter by priority 2. Under each section, add a text box for the description of the task"
**Built:** High, Medium and Low priority (a chip on each task and a dot in the planner), a priority filter and sort, and a multi-line description per task.

### 7. Section descriptions
**Request:** "Description for each section"
**Built:** an optional description under each section heading.

### 8. Notes box
**Request:** "Add a section above the calendar, where I can take adhoc notes"
**Built:** an auto-growing notes area saved as `S.scratch`.

### 9. Reorder within a day
**Request:** "In the calendar preview: 1. Give me the option to reorder the tasks underneath each day"
**Built:** drag planned chips up or down within a day, or between days (order is stored in `pord`), with an Up/Down fallback when you tap a chip's grip.

### 10. Google Calendar and month view
**Request:** "1. Can you also connect the calendar preview to my current google calendar? 2. Add an option where I can expand and see the full month"
**Built:** live Google Calendar events (through Claude's connector, refreshed every 5 minutes, never stored in the page) with a status line, and a Week/Month switch. The month grid shows chips, with dots on phones, and tapping a date opens it.

### 11. Section navigation
**Request:** "On the LHS of the to do list, add a list of all the subheadings so I can instantly jump to that section when I click on it"
**Built:** a sticky left-hand section list with to-do counts that highlights the section you're scrolled to. On phones it becomes a sticky horizontal chip row.

### 12. Reorder from the navigation
**Request:** "Under sections tabs on the LHS, give the option to drag and drop the order so its also reflected on the RHS"
**Built:** drag sections in the navigation list (or use the arrow keys) to reorder the sections themselves.

### 13. Day view, add section, mass edit
**Request:** "1. Calendar preview: Give me an option to see it by day as well so it's bigger 2. Under the section tabs on the LHS, add an option to 'Add section' 3. Give an option to mass edit (delete, move to different sub headings) tasks"
**Built:** a Day view with planned tasks, calendar events and due items, an "+ Add section" button in the navigation, and "Select tasks" mode with "Select all" per section and a bottom action bar (Move to, Priority, Mark done, Delete with a confirm tap).

### 14. Bulk plan and add to calendar
**Request:** "When selecting tasks, give me the option to add to calendar and delegate to a date"
**Built:** a date and optional time in the action bar, plus "Plan for date" and "Plan + add to Google Calendar". Events are all-day and don't block your time, or last one hour at the chosen time, and failures are reported clearly.

### 15. Per-task planning
**Request:** "Under each task, give me the option to delegate to a date in the calendar"
**Built:** "Plan for a date" (a date picker) on each task. Planned tasks show "Planned Thu, 8 Oct" (tap to change it), an Unplan link and an "Add to Google Calendar" button.

### 16. Month-view drag and drop
**Request:** "In the month view, give me the option to drag and drop tasks to whatever date"
**Built:** drag list tasks onto any month date, and drag month chips between dates (the whole chip is the handle; tap to jump to the task). Tasks are listed before events in each cell, and "+N more" opens the day.

### 17. Undo
**Request:** "Add a undo button"
**Built:** a floating Undo button and Ctrl/Cmd+Z. It keeps snapshots of the last 60 changes and treats a burst of typing as one step.

### 18. Filters beside the list, and a planned-date filter
**Request:** "Make sure your filter/sorting system is connected to the to do list tasks. Add a filter where I can see the tasks that dont have an allocated planned date"
**Built:** a filter bar directly above the list: Planned (All, Not planned or Planned), Priority, Sort (adds Planned date) and Hide completed. It shows a "Showing N of M" line with "Clear filters", hides sections with no matches, and shows an empty-results message.

### 19. Hosting question
**Request:** "host this UI in a web server so that I can open it in google chrome"
**Outcome:** the claude.ai artifact link already opens in Chrome, and that's where saving and Google Calendar work. That question led to this repository.

### 20. GitHub version (this repository)
**Request:** share the project on GitHub without personal tasks, with a fallback for running outside Claude, and with AI context.
**Built:**
- The embedded state was reset to an empty **Inbox**.
- Browser saving (`localStorage['todo.state.v1']`) when not running inside Claude, with an "Export backup / Import backup" row.
- A calendar adapter interface (`window.TodoCalendar` in `calendar-adapter.js`) with a Microsoft Graph (Outlook) example. Calendar buttons hide when no calendar is connected.
- `README.md`, `CLAUDE.md` and this file.

---

## Rebuild in one go

To recreate the current app from nothing, give an assistant `CLAUDE.md` plus this prompt:

> Build `index.html` as described in CLAUDE.md: a single-file, dependency-free to-do planner with sections, tasks (due date, planned date, priority, description, subtasks), pointer-event drag and drop with phone fallbacks, Day/Week/Month planner, section navigation, select mode with bulk actions, filters and sorting, undo, a notes box, saving to localStorage outside Claude and through the artifact capability inside Claude, and an optional calendar through `window.TodoCalendar`. Follow the data model, conventions and layout rules in CLAUDE.md exactly, and test at 1100px and 400px.
