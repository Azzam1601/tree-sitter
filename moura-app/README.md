# مورا — التطبيق الشامل (Moura Comprehensive App)

A single-file, offline-capable **PWA** for managing a fuel station. The UI is
Arabic (RTL) and the app runs entirely in the browser — no backend, all state
is kept in `localStorage`.

> **Status:** `v1.0` · internal demo / prototype (نموذج تجريبي داخلي).
> All data is seeded and stored locally in the browser. A real multi-site
> deployment would require a central database.

## Contents

| File | Purpose |
| --- | --- |
| `index.html` | The whole application — markup, styles, and logic in one file. |
| `sw.js` | Service worker providing offline caching of the app shell. |

## Features

- **Role-based access** — 7 roles (sales operator, shift supervisor, site
  manager, accountant, general manager, maintenance technician, customer
  service), each seeing only its permitted modules.
- **Sales** — pump meter readings for 3 products (91, 95, diesel), payment
  breakdown by method, zero-tolerance reconciliation, tank levels with low-stock
  alerts, cash reconciliation, and a printable shift report.
- **Maintenance** — fault reports with severity, status workflow, and repair-cost
  approval routing.
- **Customer service** — complaint intake, categorization, and official
  responses.
- **Notifications** — an in-app notification center with role targeting, plus
  best-effort Web Notifications when permission is granted.
- **Audit log** — append-only record of key operations (visible to the GM).
- **Theming** — light/dark toggle, persisted locally.

## Running it

Because it registers a service worker, serve it over `http://localhost` (or
HTTPS) rather than opening the file directly:

```bash
cd moura-app
python3 -m http.server 8000
# then open http://localhost:8000
```

**Demo login:** every role uses the PIN **`1234`**.

## Reset

Use *الإعدادات → إعادة تعيين النموذج* (Settings → Reset) to clear all local data,
or clear the site's `localStorage` in the browser.
