# EduSprint Architecture

## Overview
EduSprint is a client-side React + TypeScript Progressive Web App with local-first persistence.

## Architectural layers

### 1) UI components (`components/`)
- Presentational and interaction-heavy React components.
- Components receive domain data and callbacks via props.
- No direct storage access in most components.

Current components:
- `TopBar.tsx`
- `StudyTimer.tsx`
- `Decks.tsx`
- `CardEditor.tsx`
- `Quiz.tsx`

### 2) App orchestrator (`App.tsx`)
- Owns global app state (`db`, active tab, active deck).
- Coordinates user actions (add/update/delete cards/decks, grade reviews, import/export).
- Wires domain logic from `lib/storage.ts` into UI interactions.

### 3) Domain and persistence (`lib/`)
- `types.ts`: app domain models (`Deck`, `Card`, `Session`, `DB`).
- `utils.ts`: shared pure helpers (`uid`, `now`, `formatTime`).
- `storage.ts`: localStorage persistence and spaced repetition helpers (`dueCards`, `gradeCard`).

## Runtime data flow
1. `App` loads DB from `localStorage` using `loadDB()`.
2. `App` renders child components and passes state/actions as props.
3. User actions update `db` state in `App`.
4. `useEffect` in `App` persists new state via `saveDB()`.

## Improvement made
The repository now follows the architecture implied by imports:
- UI modules moved under `components/`.
- domain/persistence modules moved under `lib/`.

This removes path mismatches, clarifies ownership boundaries, and makes the project easier to scale.

## Next recommended improvements
- Add unit tests for `gradeCard()` and import validation.
- Introduce a small `useDB` hook to isolate state mutations from `App.tsx`.
- Add runtime schema validation for imported JSON (e.g. zod) to reduce corrupt data risk.
