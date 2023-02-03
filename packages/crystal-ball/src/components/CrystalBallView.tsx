import { camelCase } from "lodash";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { wizardTheme } from "@xstate-wizards/wizards-of-react";
import { TSpellMap } from "@xstate-wizards/spells";
import { TCrystalBallViewSections, TCrystalBallViewSectionSpellConfig } from "../types";
import { CrystalBall } from "./CrystalBall";

type TCrystalBallViewProps = {
  sections: TCrystalBallViewSections;
  spellMap: TSpellMap;
};

// RENDER
export const CrystalBallView: React.FC<TCrystalBallViewProps> = ({ sections, spellMap }) => {
  // const navigate = useNavigate();
  const [focusedSpellKey, setFocusedSpellKey] = useState<string>("");

  // OUTLINE HELPERS
  const setupOutline = (spellOutline: TCrystalBallViewSectionSpellConfig) => {
    // --- set params
    const params = new URLSearchParams();
    params.set("spellKey", spellOutline.spellKey);
    // --- set focus/machine, reset target node highlighting
    setFocusedSpellKey(spellOutline.spellKey);
  };

  // ON MOUNT
  // --- On load check for query param to load up a specific machine
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const spellKey = params.get("spellKey");
    // --- find outline
    for (const section of sections) {
      for (const spellConfig of section.spells) {
        if (spellKey && spellConfig.spellKey === spellKey) {
          return setupOutline(spellConfig);
        }
      }
    }
  }, []);

  return (
    <StyledCrystalBallView>
      <div className="cb-view__sections">
        <div className="cb-view__sections__header">
          <div>
            <h1>Crystal Ball</h1>
          </div>
        </div>
        {sections.map(
          ({ sectionTitle, spells }: { sectionTitle: string; spells: TCrystalBallViewSectionSpellConfig[] }) => (
            <div key={sectionTitle} className="cb-view__section">
              <div className="cb-view__section__header">
                <p>{sectionTitle}</p>
              </div>
              {spells.map((spellOutline: TCrystalBallViewSectionSpellConfig) => (
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
          )
        )}
      </div>
      <div className="cb-view__viewer">
        {focusedSpellKey && spellMap[focusedSpellKey] && (
          <div className="cb-view__viewer__header">
            <span>
              <small>#{focusedSpellKey}</small>
            </span>
          </div>
        )}
        <div className="cb-view__viewer__body">
          {focusedSpellKey && spellMap[focusedSpellKey] && (
            <CrystalBall key={focusedSpellKey} spellKey={focusedSpellKey} spellMap={spellMap} />
          )}
        </div>
      </div>
    </StyledCrystalBallView>
  );
};

const StyledCrystalBallView = styled.div`
  display: flex;
  width: 100%;
  height: 100%;

  .cb-view__sections {
    width: 360px;
    max-width: 360px;
    height: 100%;
    overflow: scroll;
    padding: 0;
    background: ${wizardTheme.colors.white[800]};
    display: flex;
    flex-direction: column;
    .cb-view__sections__header {
      width: 100%;
      padding: 0.25em 1em;
      background: ${wizardTheme.colors.white[700]};
      border-bottom: 2px solid ${wizardTheme.colors.white[500]};
      margin-bottom: 0.5em;
      h6 {
        color: ${wizardTheme.colors.gray[700]};
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
    .cb-view__section {
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

  .cb-view__viewer {
    width: 100%;
    overflow: scroll;
    background: ${wizardTheme.colors.white[600]};
    .cb-view__viewer__header {
      background: ${wizardTheme.colors.white[500]};
      width: 100%;
      padding: 0.25em 1em;
      display: flex;
      justify-content: space-between;
      span {
        &:first-of-type > small {
          color: ${wizardTheme.colors.gray[900]};
        }
      }
    }
    .cb-view__viewer__body {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
    }
  }
`;
