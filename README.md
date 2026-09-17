# BookIt

BookIt is a small resource-booking app for shared workplace items such as meeting rooms, projectors, camera kits, and demo laptops. The app is intentionally simple, lightweight, and easy to run on a local machine.

It allows a user to:

- view the list of available resources
- choose a date
- create a booking with time, name, and purpose
- prevent double booking on the same resource
- cancel an existing booking
- see the bookings for a selected day

## Tech stack

- Plain HTML, CSS, and JavaScript for the frontend
- Node.js with Express for the backend API
- JSON file storage for local persistence

This is a practical choice for a small project because it keeps setup simple and still demonstrates the real booking logic clearly.

## What works

- list of seeded resources
- booking creation with validation
- conflict detection for overlapping bookings on the same resource
- daily booking view
- booking cancellation
- clear error messages for invalid requests

## Explicit decision on edge cases

I treat bookings that touch at the boundary as non-overlapping. In other words:

- 09:00–10:00 and 10:00–11:00 are allowed together
- 09:00–10:00 and 09:30–10:30 are rejected as a clash

This is documented in the decision log and is enforced in the overlap comparison.

## How to run in under five minutes

1. Open a terminal in the project folder.
2. Run:

```bash
npm install
npm run dev
```

3. Open this in the browser:

```text
http://localhost:5000
```

## Project structure

- public/ — frontend files
- server.js — backend API and static file server
- server/bookings.json — saved booking data

## Notes

This project chooses simplicity over complexity. It uses a JSON file instead of a database because the goal is a working resource-booking system that is easy to understand and easy to run.

## Stretch item chosen

I did not add a stretch feature. The core booking flow is the priority, and I chose to finish the required feature set cleanly rather than add bonus functionality that could introduce risk.

## Time spent

This project took roughly 6–8 hours in total, including setup, testing, debugging, and documentation.

