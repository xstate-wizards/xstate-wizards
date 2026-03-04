import { format } from "date-fns";
import React from "react";

import { Dialog } from "../overlays/Dialog";

export function ellipseString(string = "", limit = 180, endString = "...") {
  return string.length > limit ? `${string.slice(0, limit)}${endString}` : string;
}

export const SpellStateHistory = ({ editor, onUpdate, stateName }) => {
  return (
    <div className="xw-sb__state-history">
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
    </div>
  );
};