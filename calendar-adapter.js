/*
 * Calendar adapter (optional)
 * ---------------------------
 * The to-do app shows calendar events in its Day / Week / Month planner and can add
 * planned tasks to a calendar. It looks for one global object, window.TodoCalendar.
 *
 *   window.TodoCalendar = null   -> no calendar (default). Tasks still plan onto dates.
 *   window.TodoCalendar = {...}  -> use your own calendar (Outlook, Google, iCloud, ...).
 *
 * When the page runs inside Claude (claude.ai) and no adapter is set, it uses
 * Claude's Google Calendar connector instead.
 *
 * The interface the app expects:
 *
 *   window.TodoCalendar = {
 *     name: 'Outlook',                       // shown in the UI ("Add to Outlook")
 *
 *     // Called whenever the visible range changes. Call onData(events) whenever you
 *     // have events (as often as you like), or onData(null, error) on failure.
 *     // Return a function that stops any polling.
 *     watch: function (range, onData) { ... return function stop() {}; },
 *       // range = { start: Date, end: Date, timeZone: 'Area/City' }
 *       // events = [{ title, start, end, allDay, link }]
 *       //   all-day: start/end are 'YYYY-MM-DD' (end may be omitted)
 *       //   timed:   start/end are ISO strings or Date objects
 *
 *     // Optional. Called for "Add to <name>". Return a Promise.
 *     create: function (task) { ... }
 *       // task = { title, date: 'YYYY-MM-DD', time: 'HH:MM' | null,
 *       //          durationMinutes, timeZone, description }
 *       // time === null means an all-day event.
 *   };
 */
window.TodoCalendar = null;


/* ------------------------------------------------------------------------------
 * EXAMPLE: Outlook / Microsoft 365 via Microsoft Graph (not active).
 *
 * To use it:
 *  1. Register a single-page app in Microsoft Entra ID (Azure portal > App registrations),
 *     add your site's URL as a SPA redirect URI, and give it the delegated
 *     permission Calendars.ReadWrite.
 *  2. Add MSAL to index.html, before this file:
 *       <script src="https://alcdn.msauth.net/browser/2.38.3/js/msal-browser.min.js"></script>
 *  3. Put your client ID below, delete the "return;" line, and host the files on a web
 *     server (for example GitHub Pages). It won't sign in from a file:// URL.
 * ------------------------------------------------------------------------------ */
(function () {
  return; // <- remove this line to turn the Outlook example on

  var CLIENT_ID = 'YOUR-APP-CLIENT-ID';
  var SCOPES = ['Calendars.ReadWrite'];
  var GRAPH = 'https://graph.microsoft.com/v1.0';
  var msalApp = new msal.PublicClientApplication({
    auth: { clientId: CLIENT_ID, authority: 'https://login.microsoftonline.com/common', redirectUri: location.origin + location.pathname },
    cache: { cacheLocation: 'localStorage' }
  });
  var ready = msalApp.initialize();

  function token() {
    return ready.then(function () {
      var acct = msalApp.getAllAccounts()[0];
      if (acct) {
        return msalApp.acquireTokenSilent({ scopes: SCOPES, account: acct })
          .catch(function () { return msalApp.acquireTokenPopup({ scopes: SCOPES }); });
      }
      return msalApp.loginPopup({ scopes: SCOPES }).then(function () {
        return msalApp.acquireTokenSilent({ scopes: SCOPES, account: msalApp.getAllAccounts()[0] });
      });
    }).then(function (r) { return r.accessToken; });
  }

  function graph(path, opts, tz) {
    opts = opts || {};
    return token().then(function (t) {
      var headers = { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' };
      if (tz) headers.Prefer = 'outlook.timezone="' + tz + '"';
      return fetch(GRAPH + path, { method: opts.method || 'GET', headers: headers, body: opts.body });
    }).then(function (res) {
      if (!res.ok) return res.text().then(function (b) { throw new Error('Graph ' + res.status + ' ' + b.slice(0, 120)); });
      return res.status === 204 ? null : res.json();
    });
  }

  function pad(n) { return String(n).padStart(2, '0'); }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  window.TodoCalendar = {
    name: 'Outlook',
    watch: function (range, onData) {
      var stopped = false;
      function load() {
        var q = '/me/calendarView?startDateTime=' + encodeURIComponent(range.start.toISOString()) +
                '&endDateTime=' + encodeURIComponent(range.end.toISOString()) +
                '&$top=250&$select=subject,start,end,isAllDay,webLink&$orderby=start/dateTime';
        graph(q, null, range.timeZone).then(function (data) {
          if (stopped) return;
          onData((data.value || []).map(function (e) {
            return {
              title: e.subject,
              allDay: e.isAllDay,
              // With the Prefer header, times come back in range.timeZone without an offset,
              // which the browser reads as local time.
              start: e.isAllDay ? e.start.dateTime.slice(0, 10) : e.start.dateTime,
              end: e.isAllDay ? e.end.dateTime.slice(0, 10) : e.end.dateTime,
              link: e.webLink
            };
          }));
        }).catch(function (err) { if (!stopped) onData(null, err); });
      }
      load();
      var timer = setInterval(load, 5 * 60 * 1000);
      return function () { stopped = true; clearInterval(timer); };
    },
    create: function (task) {
      var start, end, allDay = !task.time;
      if (allDay) {
        var d = new Date(task.date + 'T00:00:00'); var n = new Date(d); n.setDate(n.getDate() + 1);
        start = task.date + 'T00:00:00'; end = ymd(n) + 'T00:00:00';
      } else {
        var s = new Date(task.date + 'T' + task.time + ':00');
        var e = new Date(s.getTime() + (task.durationMinutes || 60) * 60000);
        start = task.date + 'T' + task.time + ':00';
        end = ymd(e) + 'T' + pad(e.getHours()) + ':' + pad(e.getMinutes()) + ':00';
      }
      return graph('/me/events', { method: 'POST', body: JSON.stringify({
        subject: task.title,
        body: { contentType: 'text', content: task.description || '' },
        start: { dateTime: start, timeZone: task.timeZone },
        end: { dateTime: end, timeZone: task.timeZone },
        isAllDay: allDay,
        showAs: allDay ? 'free' : 'busy'
      }) });
    }
  };
})();
