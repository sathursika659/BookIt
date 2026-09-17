# AI-USAGE

I used GitHub Copilot to help speed up the setup and debugging process. I used it mainly for code structure, API route design, and writing the README and decision notes.

## Prompts I actually used

1. "Build a simple booking app with Express backend and static frontend, with resource booking and time conflict checks."
2. "Help me fix the ES module/CommonJS issue and make the server serve the public folder correctly."
3. "Write a clean README and decision log for this project in plain English."

## What AI helped with

AI was useful for:

- generating a working Express server skeleton
- suggesting the structure for the frontend and backend split
- helping shape the validation and overlap logic
- drafting documentation and project notes

## One thing I rejected

One AI suggestion was to keep a React + Vite setup for the project. That was not the best fit for the actual requirement because the brief allowed a simple app and the project was faster and more reliable as a static HTML frontend with a Node API. I rejected that path because it added unnecessary setup and complexity for a small local booking app.

## Why I still checked manually

AI helped with speed, but I did not blindly trust it. I checked the server logic, route behavior, overlap handling, and final docs manually. This was important because the booking rule is the core of the app and must be correct.

## Final note

AI was helpful as a coding assistant, but the final responsibility stayed with me. I used it to accelerate the work, then validated and corrected the result before finishing.
