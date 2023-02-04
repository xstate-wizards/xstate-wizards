import React from "react";
import { CrystalBallView, TCrystalBallViewSections } from "@xstate-wizards/crystal-ball";
import { spellMap } from "../spells/spellMap";
import { ID_EXAMPLE_SCREENER } from "../spells/exampleScreener";
import { ID_EXAMPLE_INTERVIEW } from "../spells/exampleInterview";
import styled from "styled-components";

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
    <StyledOutline>
      <CrystalBallView sections={sections} spellMap={spellMap} />
    </StyledOutline>
  );
};

const StyledOutline = styled.div`
  width: 100%;
  height: 100%;
  max-height: 100vh;
  max-width: 100vw;
  overflow: hidden;
  position: absolute;
`;
