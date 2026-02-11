import React, { useEffect, useMemo, useRef, useState } from "react";
import { formatTime } from "../lib/utils";

export default function StudyTimer({
  onSession
}: {
  onSession: (secondsFocused: number, breaksTaken: number) => void;
}) {
  const [focusMin, setFocusMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const breaksTaken = useRef(0);
  const focusedSeconds = useRef(0);

  useEffect(() => {
    setSecondsLeft((mode === "focus" ? focusMin : breakMin) * 60);
  }, [focusMin, breakMin, mode]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft(s => Math.max(0, s - 1));
      if (mode === "focus") focusedSeconds.current += 1;
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, mode]);

  useEffect(() => {
    if (!running) return;
    if (secondsLeft !== 0) return;

    // swap mode
    if (mode === "focus") {
      setMode("break");
      breaksTaken.current += 1;
    } else {
      setMode("focus");
    }
    // keep running
  }, [secondsLeft, running, mode]);

  function stopAndSave() {
    setRunning(false);
    onSession(focusedSeconds.current, breaksTaken.current);
    focusedSeconds.current = 0;
    breaksTaken.current = 0;
  }

  const hint = useMemo(() => {
    return mode === "focus"
      ? "Focus time. Put phone away. One task only."
      : "Break time. Stand up, water, eyes off screen.";
  }, [mode]);

  return (
    <div className="card">
      <div className="row" style={{ alignItems: "center" }}>
        <div className="h2">Timer</div>
        <span className="badge">{mode === "focus" ? "Focus" : "Break"}</span>
        <span className="small right">
          Shortcut: <span className="kbd">Space</span> start/pause • <span className="kbd">S</span> stop
        </span>
      </div>

      <div className="sep" />

      <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: 1 }}>
        {formatTime(secondsLeft)}
      </div>
      <div className="p">{hint}</div>

      <div className="sep" />

      <div className="row">
        <div className="col">
          <div className="small">Focus (min)</div>
          <input
            className="field"
            type="number"
            min={5}
            max={90}
            value={focusMin}
            onChange={e => setFocusMin(Number(e.target.value))}
            disabled={running}
          />
        </div>
        <div className="col">
          <div className="small">Break (min)</div>
          <input
            className="field"
            type="number"
            min={1}
            max={30}
            value={breakMin}
            onChange={e => setBreakMin(Number(e.target.value))}
            disabled={running}
          />
        </div>
      </div>

      <div className="sep" />

      <div className="row">
        <button className={"btn primary"} onClick={() => setRunning(r => !r)}>
          {running ? "Pause" : "Start"}
        </button>
        <button className="btn" onClick={() => setMode(m => (m === "focus" ? "break" : "focus"))} disabled={running}>
          Switch
        </button>
        <button className="btn" onClick={() => { setSecondsLeft((mode === "focus" ? focusMin : breakMin) * 60); }} disabled={running}>
          Reset
        </button>
        <button className="btn bad" onClick={stopAndSave}>
          Stop & Save Session
        </button>
      </div>
    </div>
  );
}
