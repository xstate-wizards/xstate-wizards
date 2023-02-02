import React, { useState } from "react";
import { CrystalBall, TOutlineSections, TOutlineSpellConfig } from "@xstate-wizards/crystal-ball";

import { spellMap } from "../spells/spellMap";
import { ID_EXAMPLE_SCREENER } from "../spells/exampleScreener";
import { ID_EXAMPLE_INTERVIEW } from "../spells/exampleInterview";
import { camelCase } from "lodash";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  THEME_COLOR_GRAY_700,
  THEME_COLOR_GRAY_900,
  THEME_COLOR_WHITE_500,
  THEME_COLOR_WHITE_600,
  THEME_COLOR_WHITE_700,
  THEME_COLOR_WHITE_800,
} from "../theme";

const spellsToOutline: TOutlineSections = [
  {
    sectionTitle: "Steps",
    spells: [
      {
        title: "Example Screener",
        spellKey: ID_EXAMPLE_SCREENER,
        link: "#",
      },
      {
        title: "Example Interview",
        spellKey: ID_EXAMPLE_INTERVIEW,
        link: "#",
      },
    ],
  },
];

// RENDER
export const Outline = () => {
  const navigate = useNavigate();
  const [focusedSpellKey, setFocusedSpellKey] = useState<string>("");

  // OUTLINE HELPERS
  const setupOutline = (spellOutline: TOutlineSpellConfig) => {
    // --- set params
    const params = new URLSearchParams();
    params.set("spellKey", spellOutline.spellKey);
    navigate({ search: `?${params}` });
    // --- set focus/machine, reset target node highlighting
    setFocusedSpellKey(spellOutline.spellKey);
  };

  return (
    <StyledOutlines>
      <div className="picker">
        <div className="picker__header">
          <div>
            <h1>Outlines</h1>
          </div>
        </div>
        {spellsToOutline.map(({ sectionTitle, spells }: { sectionTitle: string; spells: TOutlineSpellConfig[] }) => (
          <div key={sectionTitle} className="outline-topic">
            <div className="outline-topic__header">
              <p>{sectionTitle}</p>
            </div>
            {spells.map((spellOutline: TOutlineSpellConfig) => (
              <button
                id={camelCase(`${sectionTitle} ${spellOutline.title}`)}
                key={spellOutline.title}
                disabled={focusedSpellKey === spellOutline.spellKey}
                onClick={() => setupOutline(spellOutline)}
              >
                {spellOutline.title}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="viewer">
        {focusedSpellKey && spellMap[focusedSpellKey] && (
          <div className="viewer__header">
            <span>
              <small>#{focusedSpellKey}</small>
            </span>
          </div>
        )}
        <div className="outline">
          {focusedSpellKey && spellMap[focusedSpellKey] && (
            <CrystalBall key={focusedSpellKey} spellKey={focusedSpellKey} spellMap={spellMap} />
          )}
        </div>
      </div>
    </StyledOutlines>
  );
};

// TODO:
const StyledOutlines = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;

  .picker {
    width: 360px;
    max-width: 360px;
    height: 100%;
    overflow: scroll;
    padding: 0;
    background: ${THEME_COLOR_WHITE_800};
    display: flex;
    flex-direction: column;
    .picker__header {
      width: 100%;
      padding: 0.25em 1em;
      background: ${THEME_COLOR_WHITE_700};
      border-bottom: 2px solid ${THEME_COLOR_WHITE_500};
      margin-bottom: 0.5em;
      h6 {
        color: ${THEME_COLOR_GRAY_700};
      }
      button {
        font-size: 9px;
      }
      div {
        margin-top: 4px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-weight: 500;
      }
    }
    .outline-topic {
      margin: 0.5em 1em;
      &__header {
        margin-bottom: 0.5em;
      }
      & > button,
      small {
        display: flex;
        width: 100%;
        margin-bottom: 0.5em;
      }
    }
  }

  .viewer {
    width: 100%;
    overflow: scroll;
    background: ${THEME_COLOR_WHITE_600};
    .viewer__header {
      background: ${THEME_COLOR_WHITE_500};
      width: 100%;
      padding: 0.25em 1em;
      display: flex;
      justify-content: space-between;
      span {
        &:first-of-type > small {
          color: ${THEME_COLOR_GRAY_900};
        }
      }
    }
    .outline {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
    }
  }
`;
