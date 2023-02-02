import React, { useState } from "react";
import styled from "styled-components";

export const NodeNotes: React.FC<{ notes: { date: string; text: string }[] }> = ({ notes }) => {
  const [showNotes, setShowNotes] = useState(false);
  return (notes || []).length > 0 ? (
    <StyledNodeNotes>
      <small onClick={() => setShowNotes(!showNotes)}>Notes {!showNotes ? "+" : "-"}</small>
      {showNotes &&
        notes.map((note, noteIndex) => (
          <div key={noteIndex}>
            [{note.date}]&emsp;{note.text}
          </div>
        ))}
    </StyledNodeNotes>
  ) : null;
};

const StyledNodeNotes = styled.div`
  background: ${(props) => props.theme.colors.white[800]};
  width: 100%;
  padding: 1em 0.25em 0.25em;
  margin-top: 0.5em;
  border-top: 1px solid ${(props) => props.theme.colors.white[500]};
  border-radius: 12px;
  & > small {
    text-decoration: underline;
    &:hover {
      cursor: pointer;
    }
  }
  &,
  small {
    font-size: 11px;
  }
`;
