# BookIt

BookIt is a small resource-booking web app for shared workplace items such as meeting rooms, projectors, camera kits, and demo laptops. The goal is to replace messy group-chat coordination with a simple booking flow that prevents double-booking.

## What this app does

- lists the available bookable resources
- allows a user to create a booking with resource, date, start time, end time, name, and purpose
- blocks overlapping confirmed bookings on the same resource
- shows bookings for the selected date
- allows confirmed bookings to be cancelled
- validates input and returns clear error messages

## Tech stack

- HTML, CSS, and JavaScript for the frontend
- Node.js with Express for the backend API
- JSON file storage for local persistence

This was chosen to keep the project simple, local, and easy to run without extra setup.

## Explicit edge-case decision

Bookings that touch at the boundary are treated as non-overlapping.

- 09:00–10:00 and 10:00–11:00 are allowed together
- 09:00–10:00 and 09:30–10:30 are rejected as a clash

This is also documented in the decision log.

## How to run in under five minutes

1. Open a terminal in the project folder.
2. Run:

```bash
npm install
npm run dev
```

3. Open this in a browser:

```text
http://localhost:5000
```

## Project structure

- public/ — frontend pages and scripts
- server.js — Express backend and static file server
- server/bookings.json — saved booking data

## What works well

- seeded resource list
- input validation
- overlap detection on the same resource
- daily bookings view
- cancellation flow
- clear error feedback

## Stretch item choice

No stretch feature was added. I kept the scope focused on the core booking flow so the app stayed correct and easy to verify.

## Time spent

This project took roughly 6–8 hours in total, including setup, debugging, testing, and writing the supporting notes.

