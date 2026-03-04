import { camelCase } from "lodash";
import React, { useEffect, useState } from "react";
import { TSpellMap } from "@xstate-wizards/spells";
import { TCrystalBallViewSections, TCrystalBallViewSectionSpellConfig } from "../types";
import { CrystalBall } from "./CrystalBall";
import { OutlineCondVisibility, useOutline } from "../data/OutlineStore";

type TCrystalBallViewProps = {
  sections: TCrystalBallViewSections;
  spellMap: TSpellMap;
};

// RENDER
export const CrystalBallView: React.FC<TCrystalBallViewProps> = ({ sections, spellMap }) => {
  // const navigate = useNavigate();
  const [focusedSpellKey, setFocusedSpellKey] = useState<string>("");
  const { initConditionalVisibility, setInitConditionalVisibility } = useOutline();

  // OUTLINE HELPERS
  const setupOutline = (spellOutline: TCrystalBallViewSectionSpellConfig) => {
    // --- set params
    const params = new URLSearchParams();
    params.set("spellKey", spellOutline.spellKey);
    // --- update url
    window.history.replaceState({}, "", `${location.pathname}?${params}`);
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
    <div className="xw-cb--view">
      <div className="xw-cb--sections">
        <div className="xw-cb--sections-header">
          <div>
            <h1>🔮</h1>
          </div>
        </div>
        {sections.map(
          ({ sectionTitle, spells }: { sectionTitle: string; spells: TCrystalBallViewSectionSpellConfig[] }) => (
            <div key={sectionTitle} className="xw-cb--section">
              <div className="xw-cb--section-header">
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
      <div className="xw-cb--viewer">
        {focusedSpellKey && spellMap[focusedSpellKey] && (
          <div className="xw-cb--viewer-header">
            <span>
              <small>#{focusedSpellKey}</small>
            </span>
            <span className="xw-cb--viewer-header__toggles">
              <small>Conditionals:</small>
              <button
                className={initConditionalVisibility === OutlineCondVisibility.all ? "active" : ""}
                onClick={() => setInitConditionalVisibility(OutlineCondVisibility.all)}
              >
                All
              </button>
              <button
                className={initConditionalVisibility === OutlineCondVisibility.hide ? "active" : ""}
                onClick={() => setInitConditionalVisibility(OutlineCondVisibility.hide)}
              >
                Hide
              </button>
            </span>
          </div>
        )}
        <div className="xw-cb--viewer-body">
          {focusedSpellKey && spellMap[focusedSpellKey] && (
            <CrystalBall key={focusedSpellKey} spellKey={focusedSpellKey} spellMap={spellMap} />
          )}
        </div>
      </div>
    </div>
  );
};
