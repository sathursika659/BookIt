# DECISIONS

## 1. We chose a small local JSON-backed backend

We considered a database like PostgreSQL or Firestore, but for this project a JSON file is enough. It is fast to set up, easier to run locally, and makes the booking logic easy to inspect. The trade-off is that it is not production-grade, but it is a sensible choice for a small assessment project.

## 2. We treat bookings as non-overlapping when they touch at the boundary

The brief does not explicitly say whether 09:00–10:00 and 10:00–11:00 should clash. We decided they do not clash, because the first booking ends exactly when the second one begins. This avoids blocking legitimate adjacent bookings and matches how tools like Google Calendar handle back-to-back events.

## 3. The backend performs the actual validation, not the frontend only

The frontend checks some inputs for a quick response, but the backend is the real authority. A user could bypass frontend validation entirely, so the server independently checks required fields, resource existence, time order, and overlap logic before accepting a booking.

## 4. We use a fixed resource list rather than editable resources in the app

The brief says resources do not need to be editable, so we kept them seeded and static. This keeps the app simpler and focuses the work on booking logic instead of admin features.

## 5. Cancelled bookings stay visible instead of being deleted

Cancelling a booking sets its status to "cancelled" instead of removing it from the list. This keeps a visible history for the day, and once cancelled, that time slot becomes bookable again because the overlap check only looks at bookings with status "confirmed".

## 6. We deliberately keep the UI plain and functional

The brief explicitly says that beautiful design is not the target. We kept the interface clear and usable so the focus stays on correctness and behavior rather than a large visual system.

## 7. We did not add extra stretch features

We considered adding features like "next free slot" or a weekly repeat option, but the core requirements were more important. A smaller, correct app scores higher than a larger app with broken or partial features.

## 8. We kept a single backend, not multiple duplicate versions

While building this project, we started a second copy of the project folder to try a different approach. We removed that duplicate folder once we decided to continue with the original, so there is only one working Express server to explain and run.