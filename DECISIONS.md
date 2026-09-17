# DECISIONS

## 1. We chose a small local JSON-backed backend

We considered a database like PostgreSQL or Firestore, but for this project a JSON file is enough. It is fast to set up, easier to run locally, and makes the booking logic easy to inspect. The trade-off is that it is not production-grade, but it is a sensible choice for a small assessment project.

## 2. We treat bookings as non-overlapping when they touch at the boundary

The brief does not explicitly say whether 09:00–10:00 and 10:00–11:00 should clash. We decided they do not clash, because the first booking ends exactly when the second one begins. This avoids blocking legitimate adjacent bookings and is easy to explain during a walkthrough.

## 3. The backend performs the actual validation, not the frontend only

The frontend can check some inputs, but the backend is the real authority. This matters because a user can bypass frontend validation. The server checks required fields, resource existence, time order, and overlap logic before accepting a booking.

## 4. We use a fixed resource list rather than editable resources in the app

The brief says resources do not need to be editable, so we kept them seeded and static. This keeps the app simpler, reduces scope, and focuses work on booking logic instead of admin features.

## 5. We use time-based overlap logic instead of a naive date compare

A booking is a conflict only if the same resource has another confirmed booking in the same date range and the times overlap. We compare start and end values directly to avoid false positives and false negatives.

## 6. We deliberately keep the UI plain and functional

The brief explicitly says that beautiful design is not the target. We kept the interface clear and usable so the focus stays on correctness and behavior rather than a large visual system.

## 7. We did not add extra stretch features

We considered adding features like “next free slot” or a weekly repeat option, but the core requirements were more important. A smaller, correct app scores higher than a larger app with broken or partial features.

## 8. We chose a single active server file instead of multiple duplicate versions

We removed the old duplicate backend versions and kept one working Express server. This reduces confusion, avoids port conflicts, and makes the app easier to explain and run.
