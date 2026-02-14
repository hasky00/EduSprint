import React, { useMemo, useState } from "react";
import { Card } from "../lib/types";

type Q = { prompt: string; answer: string };

export default function Quiz({ cards, deckId }: { cards: Card[]; deckId: string }) {
  const deckCards = useMemo(() => cards.filter(c => c.deckId === deckId), [cards, deckId]);

  const [count, setCount] = useState(5);
  const [qs, setQs] = useState<Q[]>([]);
  const [i, setI] = useState(0);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  function start() {
    const n = Math.min(count, deckCards.length);
    const shuffled = [...deckCards].sort(() => Math.random() - 0.5).slice(0, n);
    const gen = shuffled.map(c => ({ prompt: c.front, answer: c.back }));
    setQs(gen);
    setI(0);
    setGuess("");
    setScore(0);
    setDone(false);
  }

  function submit() {
    if (!qs.length) return;
    const a = qs[i].answer.trim().toLowerCase();
    const g = guess.trim().toLowerCase();
    const minLen = Math.max(3, Math.floor(a.length * 0.5));
    const ok = g && (a === g || (g.length >= minLen && a.includes(g)) || (g.length >= minLen && g.includes(a)));
    if (ok) setScore(s => s + 1);
    if (i + 1 >= qs.length) setDone(true);
    else {
      setI(i + 1);
      setGuess("");
    }
  }

  const cur = qs[i];

  return (
    <div className="card">
      <div className="h2">Quick Quiz</div>
      <div className="p">Generate a short quiz from the deck. Type your answer; it does fuzzy matching.</div>

      <div className="sep" />

      <div className="row">
        <div className="col">
          <div className="small">Questions</div>
          <input
            className="field"
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={e => setCount(Number(e.target.value))}
          />
        </div>
        <div className="col">
          <div className="small">Deck size</div>
          <div className="badge">{deckCards.length} cards</div>
        </div>
        <button className="btn primary" onClick={start} disabled={deckCards.length === 0}>
          Start Quiz
        </button>
      </div>

      <div className="sep" />

      {!qs.length && <div className="p">Click “Start Quiz” to generate questions.</div>}

      {!!qs.length && !done && (
        <div>
          <div className="badge">Q {i + 1} / {qs.length}</div>
          <div style={{ marginTop: 10, fontSize: 18, fontWeight: 900 }}>{cur.prompt}</div>
          <div className="p">Hint: answer in a short phrase.</div>

          <div className="sep" />

          <input
            className="field"
            placeholder="Your answer…"
            value={guess}
            onChange={e => setGuess(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") submit(); }}
          />

          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn primary" onClick={submit}>Submit</button>
            <button className="btn" onClick={() => { setGuess(cur.answer); }}>Reveal</button>
          </div>
        </div>
      )}

      {!!qs.length && done && (
        <div>
          <div style={{ fontSize: 18, fontWeight: 900 }}>Done ✅</div>
          <div className="p">Score: {score} / {qs.length}</div>
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn primary" onClick={start}>Retry</button>
            <button className="btn" onClick={() => setQs([])}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

