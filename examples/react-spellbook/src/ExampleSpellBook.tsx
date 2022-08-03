import { keyBy } from "lodash";
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
  const refreshSpells = (params?: { key: string }): $TSFixMe => {
    setSpells(getSpellsLocalStorage());
    const mockFetchedSpells =
      params?.key == null
        ? getSpellsLocalStorage()
        : keyBy(
            Object.values(getSpellsLocalStorage()).filter((s) => s.key === params?.key),
            "id"
          );
    console.log(mockFetchedSpells);
    return mockFetchedSpells;
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
      onSpellCreate={async (spell) => createSpellLocalStorage(spell)}
      onSpellPublish={async ({ increment, spell }) => publishSpellLocalStorage({ increment, spell })}
      onSpellSetActive={async ({ id, isActive }) => activeSpellLocalStorage({ id, isActive })}
      fetchSpells={() => refreshSpells()}
      fetchSpellVersions={async ({ key }) => refreshSpells({ key })}
      user={{
        id: 1,
        name: "Test User",
        email: "test@example.com",
      }}
    />
  );
};
