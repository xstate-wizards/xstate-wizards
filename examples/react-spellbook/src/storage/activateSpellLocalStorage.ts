import { $TSFixMe } from "@xstate-wizards/spells";
import { localeStorageSet, localeStorageGet, SPELLBOOK_LOCALE_STORAGE_KEY_SPELLS } from "./utils";

export const activeSpellLocalStorage = ({ id, isActive }: { id: number | string; isActive: boolean }) => {
  const spellById = (localeStorageGet(SPELLBOOK_LOCALE_STORAGE_KEY_SPELLS) ?? []).find((s) => s.id === id);
  const updatedSpells = (localeStorageGet(SPELLBOOK_LOCALE_STORAGE_KEY_SPELLS) ?? []).map((spell: $TSFixMe) => {
    // if same spell, set isActive
    if (spell.id === id) {
      return { ...spell, isActive };
    }
    // if same spell key, but not this id, set isActive to false
    if (spell.key === spellById.key) {
      return { ...spell, isActive: false };
    }
    // otherwise just return
    return spell;
  });
  localeStorageSet(SPELLBOOK_LOCALE_STORAGE_KEY_SPELLS, updatedSpells);
  return updatedSpells;
};
