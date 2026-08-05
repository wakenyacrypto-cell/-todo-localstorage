# Multi‑Timezone Digital Clock

A small single‑page clock that displays current times for multiple time zones using the browser's Intl API.

Features:
- Preset time zones (Local, UTC, New York, London, Tokyo)
- Add custom IANA time zones (e.g., America/Los_Angeles)
- Remove zones
- Toggle seconds and 12/24-hour format
- Settings and zone list persist to localStorage (key: `multi-clock:v1`)

Usage:
1. Open `clock.html` in a browser.
2. Add IANA time zones using the input and press Add.
3. Toggle options and they will be saved automatically.

Notes:
- The app uses `Intl.DateTimeFormat` with the `timeZone` option to display times; this handles DST rules correctly.
- Enter valid IANA time zone identifiers. If unsure, see the IANA tz database (e.g., `America/New_York`, `Europe/Paris`, `Asia/Tokyo`).
