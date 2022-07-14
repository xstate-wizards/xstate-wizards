import { $TSFixMe } from "@xstate-wizards/spells";
import { localeStorageSet, localeStorageGet, SPELLBOOK_LOCALE_STORAGE_KEY_SPELLS } from "./utils";

export const activeSpellLocalStorage = ({ id, isActive }: { id: number | string; isActive: boolean }) => {
  const updatedSpells = (localeStorageGet(SPELLBOOK_LOCALE_STORAGE_KEY_SPELLS) ?? []).map((spell: $TSFixMe) =>
    spell.id === id
      ? {
          ...spell,
          isActive,
        }
      : spell
  );
  localeStorageSet(SPELLBOOK_LOCALE_STORAGE_KEY_SPELLS, updatedSpells);
  return updatedSpells;
};
