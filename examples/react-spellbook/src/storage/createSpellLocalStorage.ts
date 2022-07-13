import { $TSFixMe } from "@xstate-wizards/spells";
import { v4 } from "uuid";
import { localeStorageSet, localeStorageGet, SPELLBOOK_LOCALE_STORAGE_KEY_SPELLS } from "./utils";

export const createSpellLocalStorage = (spell: $TSFixMe) => {
  localeStorageSet(
    SPELLBOOK_LOCALE_STORAGE_KEY_SPELLS,
    (localeStorageGet(SPELLBOOK_LOCALE_STORAGE_KEY_SPELLS) ?? []).concat({ id: v4(), ...spell })
  );
};
