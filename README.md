# EduSprint
PWA study timer + spaced repetition flashcards + quick quizzes.

Offline-first education toolkit:
- Spaced repetition flashcards (review due cards)
- Pomodoro-style timer + session logging
- Quick quiz generator
- Import / export JSON for sharing

## Run locally
```bash
npm install
npm run dev
```

## Architecture
See [ARCHITECTURE.md](./ARCHITECTURE.md) for component layering, data flow, and project structure.

## Project structure
- `App.tsx` — app orchestrator and state container
- `components/` — UI modules
- `lib/` — domain types, utilities, persistence logic
- `main.tsx` — React bootstrap entrypoint
