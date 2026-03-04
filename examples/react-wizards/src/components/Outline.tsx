import React from "react";
import { CrystalBallView, TCrystalBallViewSections } from "@xstate-wizards/crystal-ball";
import { spellMap } from "../spells/spellMap";
import { ID_EXAMPLE_SCREENER } from "../spells/exampleScreener";
import { ID_EXAMPLE_INTERVIEW } from "../spells/exampleInterview";

const sections: TCrystalBallViewSections = [
  {
    sectionTitle: "Wizards",
    spells: [
      {
        title: `Example Screener`,
        spellKey: ID_EXAMPLE_SCREENER,
        link: "#",
      },
      {
        title: `Example Interview`,
        spellKey: ID_EXAMPLE_INTERVIEW,
        link: "#",
      },
    ],
  },
];

// RENDER
export const Outline = () => {
  return (
    <div className="outline-page">
      <CrystalBallView sections={sections} spellMap={spellMap} />
    </div>
  );
};
