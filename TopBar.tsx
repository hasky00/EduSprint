import React, { JSX } from "react";

export default function TopBar({
  activeTab,
  setActiveTab
}: {
  activeTab: string;
  setActiveTab: (t: string) => void;
}) {
  const tabs = [
    { id: "study", label: "Study" },
    { id: "decks", label: "Decks" },
    { id: "quiz", label: "Quiz" }
  ];

  return (
    <div className="row" style={{ alignItems: "center" }}>
      <div>
        <div className="h1">EduSprint</div>
        <div className="p">Offline study toolkit: flashcards, SR reviews, quick quizzes, timer.</div>
      </div>
      <div className="right row" style={{ gap: 8 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            className={"btn " + (activeTab === t.id ? "primary" : "")}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}


