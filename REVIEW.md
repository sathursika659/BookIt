# REVIEW

## Defect 1 — no null check before changing booking status

**Line:** 25–26  
**What goes wrong:** the booking is looked up by id, but if no matching booking exists, the code tries to change `.status` on `undefined`. This would crash the application at runtime.  
**Fix:** check whether the booking exists before updating it and return a clear error if not found.  
**Severity:** High

## Defect 2 — booking ids can repeat

**Line:** 15  
**What goes wrong:** the code uses `bookings.length + 1` as the new id. If bookings are cancelled or deleted, a later booking can reuse an old id and cause inconsistent data or collisions.  
**Fix:** use a unique value such as `Date.now()` or a UUID.  
**Severity:** Medium

## Defect 3 — loose equality is used for resource comparison

**Line:** 10  
**What goes wrong:** `==` allows type coercion and can match values unexpectedly. This is especially risky when working with numeric ids from API input.  
**Fix:** use strict comparison and convert values to numbers before comparing.  
**Severity:** Low

## Defect 4 — generic conflict message is not useful

**Line:** 12  
**What goes wrong:** the code throws a generic `'Conflict'` error. A user does not know which resource is blocked or which time range caused the rejection.  
**Fix:** return a message like “Meeting Room 1 is already booked on 2026-09-20 from 09:00 to 10:00.”  
**Severity:** Medium

## Defect 5 — missing validation for required fields

**Line:** 8–22  
**What goes wrong:** the code attempts to create a booking without checking whether required data is present. Missing fields can lead to invalid bookings or runtime errors.  
**Fix:** validate resourceId, date, start time, end time, name, and purpose before creating the booking.  
**Severity:** Medium

## Defect 6 — date comparison is done on a non-Date value

**Line:** 32  
**What goes wrong:** `b.start.toISOString()` assumes `start` is a real Date object. If the value comes from JSON or plain text input, the code crashes.  
**Fix:** convert the value to a Date object before calling `toISOString()`, or store the date in a consistent string format.  
**Severity:** High

## The one I would fix first

I would fix the null-check issue first. If a booking id is missing, the app can crash during a normal cancellation request, and that is a direct reliability problem for the core workflow.

## One thing that is not a bug but I would still change

The `saveToDatabase(booking)` call is not a bug by itself, but it is misleading because it looks like data is being persisted while no actual database write is implemented. I would remove or replace it to avoid fake confidence in the code path.

## One thing I would leave alone on purpose

I would leave the `async` keyword alone if no `await` is used, because it is not a severe problem and may be part of a planned future database implementation. It is not worth changing unless the code becomes clearer or the function is refactored.