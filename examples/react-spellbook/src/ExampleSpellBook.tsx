import React, { useState } from "react";
import { SpellBook } from "@xstate-wizards/spellbook";
import { $TSFixMe } from "@xstate-wizards/spells";
import { createSpellLocalStorage } from "./storage/createSpellLocalStorage";
import { getSpellsLocalStorage } from "./storage/getSpellsLocalStorage";
import { publishSpellLocalStorage } from "./storage/publishSpellLocalStorage";
import { activeSpellLocalStorage } from "./storage/activateSpellLocalStorage";

export const ExampleSpellBook = () => {
  const [spells, setSpells] = useState<$TSFixMe>(getSpellsLocalStorage());
  const refreshSpells = () => {
    setSpells(getSpellsLocalStorage());
  };

  // RENDER
  return (
    <SpellBook
      models={{}}
      serializations={{
        functions: {},
        guards: {},
      }}
      spells={spells}
      spellsStatic={{}}
      onSpellCreate={(spell) => {
        createSpellLocalStorage(spell);
        refreshSpells();
      }}
      onSpellPublish={async ({ increment, spell }) => {
        const publishedSpell = publishSpellLocalStorage({ increment, spell });
        refreshSpells();
        return publishedSpell;
      }}
      onSpellSetActive={({ id, isActive }) => {
        activeSpellLocalStorage({ id, isActive });
        refreshSpells();
      }}
      onSpellRefetch={() => refreshSpells()}
      user={{
        id: 1,
        name: "Test User",
        email: "test@example.com",
      }}
    />
  );
};
