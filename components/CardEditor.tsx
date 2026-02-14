import React, { useMemo, useState } from "react";
import { Card } from "../lib/types";
import { uid, now } from "../lib/utils";

export default function CardEditor({
  cards,
  deckId,
  onAdd,
  onUpdate,
  onDelete
}: {
  cards: Card[];
  deckId: string;
  onAdd: (card: Card) => void;
  onUpdate: (card: Card) => void;
  onDelete: (id: string) => void;
}) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const deckCards = useMemo(() => cards.filter(c => c.deckId === deckId), [cards, deckId]);

  function add() {
    const f = front.trim();
    const b = back.trim();
    if (!f || !b) return;
    const c: Card = {
      id: uid(),
      deckId,
      front: f,
      back: b,
      dueAt: now(),
      intervalDays: 0,
      ease: 2.3,
      reps: 0,
      lapses: 0,
      updatedAt: now()
    };
    onAdd(c);
    setFront("");
    setBack("");
  }

  return (
    <div className="card">
      <div className="h2">Cards</div>
      <div className="p">Create Q/A cards. Keep them short. One fact per card.</div>

      <div className="sep" />

      <div className="row">
        <input
          className="field"
          placeholder="Front (question / prompt)"
          value={front}
          onChange={e => setFront(e.target.value)}
        />
        <input
          className="field"
          placeholder="Back (answer)"
          value={back}
          onChange={e => setBack(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") add();
          }}
        />
        <button className="btn primary" onClick={add}>
          Add
        </button>
      </div>

      <div className="sep" />

      <div className="small">{deckCards.length} cards in this deck</div>

      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
        {deckCards.map(c => (
          <div key={c.id} className="card" style={{ padding: 12, background: "rgba(2,6,23,0.25)" }}>
            <div className="row" style={{ alignItems: "center" }}>
              <div style={{ fontWeight: 800 }}>{c.front}</div>
              <button className="btn bad right" onClick={() => onDelete(c.id)}>
                Delete
              </button>
            </div>
            <textarea
              className="field"
              style={{ marginTop: 8, minHeight: 70 }}
              value={c.back}
              onChange={e => onUpdate({ ...c, back: e.target.value, updatedAt: now() })}
            />
            <div className="small" style={{ marginTop: 8 }}>
              SR: reps {c.reps} • lapses {c.lapses} • interval {c.intervalDays}d • ease {c.ease.toFixed(2)}
            </div>
          </div>
        ))}
        {deckCards.length === 0 && <div className="p">No cards yet — add a few above.</div>}
      </div>
    </div>
  );
}

