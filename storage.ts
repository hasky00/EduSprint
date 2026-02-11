import { DB, Card } from "./types";
import { now } from "./utils";

const STORAGE_KEY = "edusprint-db";

function defaultDB(): DB {
  const createdAt = now();
  return {
    decks: [{ id: "default", name: "Default", createdAt }],
    cards: [],
    sessions: [],
    activeDeckId: "default"
  };
}

export function loadDB(): DB {
  if (typeof localStorage === "undefined") return defaultDB();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultDB();
  try {
    const parsed = JSON.parse(raw);
    // basic shape check
    if (!parsed.decks || !parsed.cards) return defaultDB();
    return parsed as DB;
  } catch (e) {
    console.warn("Failed to parse stored DB", e);
    return defaultDB();
  }
}

export function saveDB(db: DB) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function exportJSON(db: DB): string {
  return JSON.stringify(db, null, 2);
}

export function importJSON(text: string): DB {
  const parsed = JSON.parse(text) as DB;
  if (!Array.isArray(parsed.decks) || !Array.isArray(parsed.cards)) {
    throw new Error("Invalid file: missing decks or cards arrays");
  }
  if (!parsed.sessions) parsed.sessions = [];
  return parsed;
}

export function dueCards(db: DB, deckId: string): Card[] {
  const t = now();
  return db.cards.filter(c => c.deckId === deckId && c.dueAt <= t);
}

// Basic SM-2 style grading
export function gradeCard(card: Card, grade: 0 | 1 | 2 | 3): Card {
  const ease = Math.max(1.3, card.ease + (grade - 1) * 0.15);
  const intervalDays = grade === 0 ? 0.5 : Math.max(1, card.intervalDays * ease);
  const dueAt = now() + intervalDays * 24 * 60 * 60 * 1000;
  return {
    ...card,
    ease,
    intervalDays,
    dueAt,
    reps: card.reps + 1,
    lapses: card.lapses + (grade === 0 ? 1 : 0),
    updatedAt: now()
  };
}
