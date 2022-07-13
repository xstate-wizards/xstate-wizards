import { keyBy } from "lodash";
import { localeStorageGet, SPELLBOOK_LOCALE_STORAGE_KEY_SPELLS } from "./utils";

export const getSpellsLocalStorage = () => keyBy(localeStorageGet(SPELLBOOK_LOCALE_STORAGE_KEY_SPELLS) ?? {}, "id");
