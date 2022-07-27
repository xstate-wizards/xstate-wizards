import React, { useState } from "react";
import { SpellBook } from "@xstate-wizards/spellbook";
import { $TSFixMe, createLocalId, initializeResourceEditor } from "@xstate-wizards/spells";
import { createSpellLocalStorage } from "./storage/createSpellLocalStorage";
import { getSpellsLocalStorage } from "./storage/getSpellsLocalStorage";
import { publishSpellLocalStorage } from "./storage/publishSpellLocalStorage";
import { activeSpellLocalStorage } from "./storage/activateSpellLocalStorage";
import { exampleModels } from "./exampleModels";

export const ExampleSpellBook = () => {
  const [spells, setSpells] = useState<$TSFixMe>(getSpellsLocalStorage());
  const refreshSpells = () => {
    setSpells(getSpellsLocalStorage());
  };

  // RENDER
  return (
    <SpellBook
      models={exampleModels}
      serializations={{
        functions: {
          getNewestResource: (resources) => {
            const modelArray = Object.values(resources);
            if (modelArray.length === 1) {
              return modelArray[0];
            }

            // @ts-expect-error
            return modelArray.sort((modelA, modelB) => parseInt(modelA?.id) - parseInt(modelB?.id))?.[0];
          },

          getIdOfResource: (resource) => {
            return resource.id;
          },
        },
        guards: {},
        actions: { initializeResourceEditor },
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
