import React, { useMemo, useState } from "react";
import { Card, Deck } from "../lib/types";
import { uid, now } from "../lib/utils";

export default function Decks({
  decks,
  cards,
  activeDeckId,
  setActiveDeckId,
  onAddDeck,
  onRenameDeck,
  onDeleteDeck
}: {
  decks: Deck[];
  cards: Card[];
  activeDeckId: string;
  setActiveDeckId: (id: string) => void;
  onAddDeck: (d: Deck) => void;
  onRenameDeck: (id: string, name: string) => void;
  onDeleteDeck: (id: string) => void;
}) {
  const [name, setName] = useState("");

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of cards) m.set(c.deckId, (m.get(c.deckId) ?? 0) + 1);
    return m;
  }, [cards]);

  function addDeck() {
    const n = name.trim();
    if (!n) return;
    const d: Deck = { id: uid(), name: n, createdAt: now() };
    onAddDeck(d);
    setName("");
    setActiveDeckId(d.id);
  }

  return (
    <div className="card">
      <div className="h2">Decks</div>
      <div className="p">Organize topics by deck (e.g., Biology, French, Algorithms).</div>

      <div className="sep" />

      <div className="row">
        <input className="field" placeholder="New deck name" value={name} onChange={e => setName(e.target.value)} />
        <input className="field" placeholder="New deck name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addDeck(); }} />
        <button className="btn primary" onClick={addDeck}>Create Deck</button>
      </div>

      <div className="sep" />

      <div style={{ display: "grid", gap: 10 }}>
        {decks.map(d => (
          <DeckRow
            key={d.id}
            deck={d}
            count={counts.get(d.id) ?? 0}
            active={d.id === activeDeckId}
            setActiveDeckId={setActiveDeckId}
            onRename={onRenameDeck}
            onDelete={onDeleteDeck}
          />
        ))}
      </div>
    </div>
  );
}

function DeckRow({
  deck, count, active, setActiveDeckId, onRename, onDelete
}: {
  deck: Deck;
  count: number;
  active: boolean;
  setActiveDeckId: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(deck.name);

  return (
    <div className="card" style={{ padding: 12, borderColor: active ? "rgba(96,165,250,0.45)" : "rgba(148,163,184,0.12)" }}>
      <div className="row" style={{ alignItems: "center" }}>
        <button className={"btn " + (active ? "primary" : "")} onClick={() => setActiveDeckId(deck.id)}>
          {active ? "Active" : "Set Active"}
        </button>

        <div style={{ flex: 1 }}>
          {editing ? (
            <input className="field" value={name} onChange={e => setName(e.target.value)} />
          ) : (
            <div style={{ fontWeight: 900 }}>{deck.name}</div>
          )}
          <div className="small">{count} cards</div>
        </div>

        {!editing ? (
          <button className="btn" onClick={() => setEditing(true)}>Rename</button>
        ) : (
          <button
            className="btn good"
            onClick={() => { setEditing(false); onRename(deck.id, name.trim() || deck.name); }}
          >
            Save
          </button>
        )}

        <button className="btn bad" onClick={() => onDelete(deck.id)}>Delete</button>
      </div>
    </div>
  );
}

