import React, { useState } from "react";
import { SpellBook } from "@xstate-wizards/spellbook";
import { $TSFixMe } from "@xstate-wizards/spells";
import { createSpellLocalStorage } from "./storage/createSpellLocalStorage";
import { getSpellsLocalStorage } from "./storage/getSpellsLocalStorage";

export const ExampleSpellBook = () => {
  const [spells, setSpells] = useState<$TSFixMe>(getSpellsLocalStorage());
  const refreshSeplls = () => {
    setSpells(getSpellsLocalStorage());
  };
  console.log("spells", spells);
  return (
    <SpellBook
      models={{}}
      serializations={{
        functions: {},
      }}
      spells={spells}
      spellsStatic={{}}
      onSpellCreate={(spell) => {
        createSpellLocalStorage(spell);
        refreshSeplls();
      }}
      onSpellPublish={async ({ increment, spell }) => {
        // TODO
        refreshSeplls();
      }}
      onSpellSetActive={({ id, isActive }) => {
        // TODO
        refreshSeplls();
      }}
      onSpellRefetch={() => refreshSeplls()}
      user={{
        id: 1,
        name: "Test User",
        email: "test@example.com",
      }}
    />
  );
};
