import React, { useEffect, useMemo, useState } from "react";
import TopBar from "./components/TopBar";
import StudyTimer from "./components/StudyTimer";
import Decks from "./components/Decks";
import CardEditor from "./components/CardEditor";
import Quiz from "./components/Quiz";
import { loadDB, saveDB, exportJSON, importJSON, dueCards, gradeCard } from "./lib/storage";
import { Card, Deck } from "./lib/types";
import { now } from "./lib/utils";

export default function App() {
  const [tab, setTab] = useState<"study" | "decks" | "quiz">("study");
  const [db, setDB] = useState(loadDB());
  const activeDeckId = db.activeDeckId ?? db.decks[0]?.id ?? "default";

  useEffect(() => saveDB(db), [db]);

  // keyboard shortcuts for tab switching (work from any tab)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
      if (e.key === "1") setTab("study");
      if (e.key === "2") setTab("decks");
      if (e.key === "3") setTab("quiz");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeDeck = useMemo(
    () => db.decks.find(d => d.id === activeDeckId) ?? db.decks[0],
    [db.decks, activeDeckId]
  );

  const due = useMemo(() => dueCards(db, activeDeckId), [db, activeDeckId]);

  function setActiveDeckId(id: string) {
    setDB({ ...db, activeDeckId: id });
  }

  function addDeck(d: Deck) {
    setDB({ ...db, decks: [d, ...db.decks] });
  }

  function renameDeck(id: string, name: string) {
    setDB({ ...db, decks: db.decks.map(d => (d.id === id ? { ...d, name } : d)) });
  }

  function deleteDeck(id: string) {
    // keep at least one deck
    if (db.decks.length <= 1) return;
    const decks = db.decks.filter(d => d.id !== id);
    const cards = db.cards.filter(c => c.deckId !== id);
    const nextActive = db.activeDeckId === id ? decks[0].id : db.activeDeckId;
    setDB({ ...db, decks, cards, activeDeckId: nextActive });
  }

  function addCard(c: Card) {
    setDB({ ...db, cards: [c, ...db.cards] });
  }

  function updateCard(c: Card) {
    setDB({ ...db, cards: db.cards.map(x => (x.id === c.id ? c : x)) });
  }

  function deleteCard(id: string) {
    setDB({ ...db, cards: db.cards.filter(c => c.id !== id) });
  }

  function grade(id: string, g: 0 | 1 | 2 | 3) {
    const card = db.cards.find(c => c.id === id);
    if (!card) return;
    const updated = gradeCard(card, g);
    setDB({ ...db, cards: db.cards.map(c => (c.id === id ? updated : c)) });
  }

  function saveSession(secondsFocused: number, breaksTaken: number) {
    const sessions = [{ startedAt: now(), secondsFocused, breaksTaken }, ...db.sessions].slice(0, 200);
    setDB({ ...db, sessions });
  }

  function downloadExport() {
    const blob = new Blob([exportJSON(db)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "edusprint-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function uploadImport(file: File | null) {
    if (!file) return;
    try {
      const text = await file.text();
      const imported = importJSON(text);
      setDB(imported);
    } catch (e) {
      alert("Import failed: invalid file format.");
    }
  }

  return (
    <div className="container">
      <TopBar activeTab={tab} setActiveTab={t => setTab(t as any)} />

      <div className="sep" />

      <div className="row" style={{ alignItems: "center" }}>
        <span className="badge">Active deck: {activeDeck?.name ?? "—"}</span>
        <span className="badge">Due now: {due.length}</span>

        <div className="right row">
          <button className="btn" onClick={downloadExport}>Export</button>
          <label className="btn" style={{ cursor: "pointer" }}>
            Import
            <input
              type="file"
              accept="application/json"
              style={{ display: "none" }}
              onChange={e => uploadImport(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </div>

      <div className="sep" />

      {tab === "study" && (
        <div className="row">
          <div className="col">
            <StudyTimer onSession={saveSession} />
            <div className="sep" />
            <ReviewPanel due={due} onGrade={grade} />
          </div>
          <div className="col">
            <CardEditor
              cards={db.cards}
              deckId={activeDeckId}
              onAdd={addCard}
              onUpdate={updateCard}
              onDelete={deleteCard}
            />
          </div>
        </div>
      )}

      {tab === "decks" && (
        <div className="row">
          <div className="col">
            <Decks
              decks={db.decks}
              cards={db.cards}
              activeDeckId={activeDeckId}
              setActiveDeckId={setActiveDeckId}
              onAddDeck={addDeck}
              onRenameDeck={renameDeck}
              onDeleteDeck={deleteDeck}
            />
          </div>
          <div className="col">
            <CardEditor
              cards={db.cards}
              deckId={activeDeckId}
              onAdd={addCard}
              onUpdate={updateCard}
              onDelete={deleteCard}
            />
          </div>
        </div>
      )}

      {tab === "quiz" && (
        <div className="row">
          <div className="col">
            <Quiz cards={db.cards} deckId={activeDeckId} />
          </div>
          <div className="col">
            <div className="card">
              <div className="h2">How to use this effectively</div>
              <div className="p">
                Keep cards atomic. Review due cards daily. If you miss, don’t panic—just resume. For tricky topics,
                add examples on the back, but keep the front short.
              </div>
              <div className="sep" />
              <div className="small">
                Tip: You can maintain separate decks per class and export/import to share with classmates.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="sep" />
      <div className="small">
        Tabs: <span className="kbd">1</span> Study • <span className="kbd">2</span> Decks • <span className="kbd">3</span> Quiz
      </div>
    </div>
  );
}

function ReviewPanel({
  due,
  onGrade
}: {
  due: Card[];
  onGrade: (id: string, grade: 0 | 1 | 2 | 3) => void;
}) {
  const [showBack, setShowBack] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
    setShowBack(false);
  }, [due.length]);

  const card = due[idx];

  if (!due.length) {
    return (
      <div className="card">
        <div className="h2">Review</div>
        <div className="p">No cards due right now. Nice.</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="row" style={{ alignItems: "center" }}>
        <div className="h2">Review</div>
        <span className="badge">Due {idx + 1}/{due.length}</span>
        <button className="btn right" onClick={() => setShowBack(s => !s)}>
          {showBack ? "Hide Answer" : "Show Answer"}
        </button>
      </div>

      <div className="sep" />

      <div style={{ fontSize: 18, fontWeight: 900 }}>{card.front}</div>
      {showBack && (
        <div className="card" style={{ marginTop: 12, padding: 12, background: "rgba(2,6,23,0.25)" }}>
          {card.back}
        </div>
      )}

      <div className="sep" />

      <div className="row">
        <button
          className="btn bad"
          onClick={() => { onGrade(card.id, 0); setShowBack(false); setIdx(i => Math.max(0, Math.min(i, due.length - 2))); }}
          title="Again"
        >
          Again
        </button>
        <button
          className="btn"
          onClick={() => { onGrade(card.id, 1); setShowBack(false); setIdx(i => Math.max(0, Math.min(i, due.length - 2))); }}
          title="Hard"
        >
          Hard
        </button>
        <button
          className="btn good"
          onClick={() => { onGrade(card.id, 2); setShowBack(false); setIdx(i => Math.max(0, Math.min(i, due.length - 2))); }}
          title="Good"
        >
          Good
        </button>
        <button
          className="btn primary"
          onClick={() => { onGrade(card.id, 3); setShowBack(false); setIdx(i => Math.max(0, Math.min(i, due.length - 2))); }}
          title="Easy"
        >
          Easy
        </button>
      </div>

      <div className="small" style={{ marginTop: 10 }}>
        Grading updates when the card is next due.
      </div>
    </div>
  );
}

