export type Deck = {
  id: string;
  name: string;
  createdAt: number;
};

export type Card = {
  id: string;
  deckId: string;
  front: string;
  back: string;
  dueAt: number; // epoch ms when next due
  intervalDays: number; // spaced repetition interval
  ease: number; // ease factor
  reps: number;
  lapses: number;
  updatedAt: number;
};

export type Session = {
  startedAt: number;
  secondsFocused: number;
  breaksTaken: number;
};

export type DB = {
  decks: Deck[];
  cards: Card[];
  activeDeckId?: string;
  sessions: Session[];
};
