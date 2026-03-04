import React, { useState } from "react";

export const NodeNotes: React.FC<{ notes: { date: string; text: string }[] }> = ({ notes }) => {
  const [showNotes, setShowNotes] = useState(false);
  return (notes || []).length > 0 ? (
    <div className="xw-cb--notes">
      <small onClick={() => setShowNotes(!showNotes)}>Notes {!showNotes ? "+" : "-"}</small>
      {showNotes &&
        notes.map((note, noteIndex) => (
          <div key={noteIndex}>
            [{note.date}]&emsp;{note.text}
          </div>
        ))}
    </div>
  ) : null;
};
