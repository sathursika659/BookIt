# AI-USAGE

I used two AI tools at different points: Claude (to explain code and help
me fix things step by step) and GitHub Copilot (which gave me an early
draft of a plain HTML + Express version of the app).

## What actually happened

I first built the app with React + Vite — backend, overlap logic, cancel
feature — with Claude, one step at a time, committing to Git along the
way. Then I switched to a simpler plain HTML/CSS/JS + Express version that
Copilot had drafted. I used Claude to read through that code, understand
it, and fix parts that didn't match my decisions or didn't work.

## Prompts I actually used

1. "Explain what this server.js file does, part by part."
2. "Why does this test fail sometimes but not other times?"
3. "Help me write DECISIONS.md and README.md based on what I actually did."

## What AI helped with

- explaining unfamiliar code (ES modules, `__dirname`)
- figuring out why a test kept failing
- drafting README, DECISIONS.md, REVIEW.md, which I then corrected to match
  what I really built

## One thing I rejected / fixed

My first AI-USAGE draft said I "rejected React + Vite." That wasn't true —
I actually built a working React version first, then switched later. I
rewrote this file to say what really happened.

## Another thing I caught

My adjacent-booking test failed the first time I ran it, even though the
logic looked right. At first I thought the logic was wrong. Turned out the
test was reusing old data from `bookings.json`, not the logic. I fixed the
test to reset that file before running, instead of changing logic that was
already correct.

## Why I still checked manually

I tested touching bookings, real overlaps, past dates, and cancelling in
the browser myself. I also read server.js line by line so I could explain
it in the walkthrough, not just trust what AI gave me.

## Final note

AI saved time on boilerplate and explanations, but I made the real
decisions and checked the app's behaviour myself before calling it done.

## Commit history note

One commit ("Build BookIt resource booking app") has a big chunk of the
Copilot-drafted code all in one step. That happened because I got it as
a working draft and committed it as one big piece instead of building it
up bit by bit myself. Looking back, I should have split that commit into
smaller ones (server routes, frontend, docs) even though it came from AI,
so the history would show the same step-by-step process as my other
commits.