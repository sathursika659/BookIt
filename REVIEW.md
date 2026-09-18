# Code Review — bookings.js

## Defects

### 1. Line 32 — crashes, `start` isn't a real Date
`.toISOString()` needs a real Date object. If `start` comes in as plain
text (which it usually does from an API), this line just crashes.
**Fix:** `new Date(b.start).toISOString()`
**Severity: High**

### 2. Line 25–26 — crashes if the id doesn't exist
If `find()` finds nothing, it returns `undefined`. Next line tries to set
`.status` on that `undefined` → crash.
**Fix:** check `if (!booking)` first, return an error instead.
**Severity: High**

### 3. Line 15 — id can repeat
`bookings.length + 1` breaks if a booking ever gets deleted — the next one
can reuse an old id.
**Fix:** use `Date.now()` instead.
**Severity: Medium**

### 4. Line 10 — using `==` not `===`
Works most of the time, but loose equality can match things it shouldn't.
**Fix:** use `===`, convert both sides to numbers.
**Severity: Low**

### 5. Line 12 — error message says nothing useful
Just throws `'Conflict'`. Doesn't say what resource or what time.
**Fix:** say which resource, which time — e.g. "Already booked 9–10."
**Severity: Medium**

### 6. Line 8–22 — no input checking
Doesn't check if resourceId/start/end are even filled in before trying to
book. Missing data can crash it or save garbage.
**Fix:** validate fields first, error out early if something's missing.
**Severity: Medium**

## If I had 30 min
I'd fix #2 first — a single wrong id request can crash the whole server,
not just one feature.

## Not a bug, but I'd change it
`saveToDatabase(booking)` on line 20 is called but never actually written
anywhere.

## I'd leave alone on purpose
The `async` keyword with no `await` inside — looks unused now, but probably
there for a future database call.