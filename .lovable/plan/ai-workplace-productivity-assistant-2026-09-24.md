# AI Workplace Productivity Assistant

## Goal
Build a polished, responsive, frontend-only productivity workspace with three input-driven writing and planning tools. Saved outputs and preferences remain in the browser.

## Experience
- Use an ivory canvas, dusty-pink accents, dark brown typography, soft shadows, compact rounded cards, and a refined sans-serif type system.
- Provide a desktop sidebar, tablet-friendly rail, and mobile bottom navigation with Dashboard, Smart Email, Meeting Notes, Task Planner, and Settings.
- Add clear loading, validation, copy confirmation, editable results, regeneration, completion controls, and local save states.

## Screens
- **Dashboard:** greeting, productivity snapshot, three feature cards, recent locally saved activity, and quick actions.
- **Smart Email:** purpose, audience, key points, outcome, tone, and length inputs; generate a tailored subject and editable body.
- **Meeting Notes:** large notes editor; generate editable summary, decisions, actions, deadlines, and follow-ups while explicitly identifying missing information.
- **Task Planner:** goal, tasks, deadline, working hours, priority, and daily/weekly mode; generate editable time blocks with completion controls and prioritisation notes.
- **Settings:** simple local profile and preference controls.

## Technical Details
- Keep all functionality client-side with React state and `localStorage`; add no database, authentication, payments, or external integrations.
- Produce unique, input-derived results locally, with no static sample answers or invented facts.
- Use the existing TanStack route at `/`, semantic Tailwind design tokens, accessible controls, and responsive layouts.
- Add route-specific metadata and verify the key flows at desktop and mobile sizes.
