import { format } from "date-fns";
import React from "react";
import styled from "styled-components";
import { Dialog } from "../overlays/Dialog";

export function ellipseString(string = "", limit = 180, endString = "...") {
  return string.length > limit ? `${string.slice(0, limit)}${endString}` : string;
}

export const SpellStateHistory = ({ editor, onUpdate, stateName }) => {
  return (
    <StyledSpellStateHistory>
      {/* Updated Timestamp */}
      <small className="section-title">Updated:</small>
      {editor?.states?.[stateName]?.updatesBy?.[0] ? (
        <small>{format(new Date(editor?.states?.[stateName]?.updatesBy?.[0]?.at), "yyyy-MM-dd")}</small>
      ) : null}
      {/* Who Touched this State */}
      <small className="section-title">Updates by:</small>
      {Array.isArray(editor?.states?.[stateName]?.updatesBy)
        ? Array.from(new Set(editor.states?.[stateName]?.updatesBy.map((u) => u.name ?? ""))).map((name: string) => (
            <small key={name}>{name}</small>
          ))
        : null}
      {/* Notes */}
      <Dialog
        trigger={
          <div className="section-notes">
            <small className="section-title">Notes:</small>
            <br />
            <small>{ellipseString(editor?.states?.[stateName]?.note, 200, "...")}</small>
          </div>
        }
      >
        <div className="dialog-notes">
          <p>
            <b>Notes for state "{stateName}"</b>:
          </p>
          <textarea
            rows={7}
            value={editor.states[stateName].note}
            onChange={(e) => onUpdate({ note: e.target.value })}
          />
        </div>
      </Dialog>
    </StyledSpellStateHistory>
  );
};

const StyledSpellStateHistory = styled.div`
  display: flex;
  flex-direction: column;
  width: 120px;
  padding: 1em 0;
  margin-left: 0.5em;
  color: #999;
  small {
    line-height: 150%;
    font-size: 11px;
    &.section-title {
      font-size: 10px;
      font-weight: 900;
      &:not(:first-of-type) {
        margin-top: 1.25em;
      }
    }
  }
  .section-notes {
    line-height: 100%;
    margin-top: 0.75em;
    small:not(.section-title) {
      font-size: 11px;
    }
    &:hover {
      text-decoration: underline;
      cursor: pointer;
    }
  }
  .dialog-notes {
    background: white;
    padding: 1em;
    color: #000;
    p {
      margin: 0 0 0.5em;
    }
    textarea {
      width: 100%;
    }
  }
`;
