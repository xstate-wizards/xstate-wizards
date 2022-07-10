import { difference, startCase } from "lodash";
import React, { useState } from "react";
import styled from "styled-components";
import { $TSFixMe, ContentNodeType, CONTENT_NODE_BACK } from "@xstate-wizards/spells";
import { CONTENT_NODE_OPTIONS } from "./consts";

// HELPERS
export const isSpecialBackButton = (c) =>
  c.type === ContentNodeType.BUTTON && c.event === "BACK" && c.attrs?.className === "x-wizard__header-back-button";
export const isSpecialBackButtonIncluded = (content) => content?.some(isSpecialBackButton) ?? false;
export const sortBackButtonToTop = (content: $TSFixMe[]) => content?.sort((a, b) => (a.attrs?.className ? -1 : 0));

type TContentNodeAdder = {
  excludeGroups?: string[];
  includeBackButton?: boolean;
  onAdd: (node: $TSFixMe) => void;
};

export const ContentNodeAdder: React.FC<TContentNodeAdder> = ({ excludeGroups, includeBackButton, onAdd }) => {
  const [addContentNodeType, setAddContentNodeType] = useState("");
  return (
    <StyledContentNodeAdder>
      <select value={addContentNodeType} onChange={(e) => setAddContentNodeType(e.target.value)}>
        <option value="">---</option>
        {difference(Object.keys(CONTENT_NODE_OPTIONS), excludeGroups ?? []).map((label) => (
          <optgroup key={label} label={label}>
            {label === "Navigation" ? (
              <option disabled={includeBackButton} value="BACK_BUTTON">
                Back Button
              </option>
            ) : null}
            {CONTENT_NODE_OPTIONS[label]?.map((type) => (
              <option key={type} value={type}>
                {startCase(type)}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <button
        disabled={!addContentNodeType}
        onClick={() => {
          if (addContentNodeType === "BACK_BUTTON") {
            // if back button, use template obj
            onAdd(CONTENT_NODE_BACK);
          } else {
            // otherwise add as is
            onAdd({ type: addContentNodeType });
          }
          setAddContentNodeType("");
        }}
      >
        + Add Content
      </button>
    </StyledContentNodeAdder>
  );
};

export const StyledContentNodeAdder = styled.div`
  padding: 0.5em 1em;
  select {
    max-width: 80px;
    width: 100%;
  }
`;
