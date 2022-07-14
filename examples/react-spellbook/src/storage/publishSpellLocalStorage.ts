import { $TSFixMe } from "@xstate-wizards/spells";
import { orderBy } from "lodash";
import { v4 } from "uuid";
import { localeStorageSet, localeStorageGet, SPELLBOOK_LOCALE_STORAGE_KEY_SPELLS } from "./utils";

export const publishSpellLocalStorage = ({ increment, spell }: { increment: "major" | "minor"; spell: $TSFixMe }) => {
  const spellsSaved = orderBy(localeStorageGet(SPELLBOOK_LOCALE_STORAGE_KEY_SPELLS) ?? [], ["createdAt"], ["desc"]);
  // DETERMINE VERSION
  const spellToIncrement = spellsSaved.find((s) => s.key === spell.key);
  const currentVersionMajor = Number(String(spellToIncrement.version).split(".")[0] ?? "0");
  const currentVersionMinor = Number(String(spellToIncrement.version).split(".")[1] ?? "0");

  // SET TO LOCAL STORAGE (mocks api)
  const newSpell = {
    // --- set props of spell
    ...spell,
    // --- then override w/ new values
    id: v4(),
    version:
      increment === "major" ? `${currentVersionMajor + 1}.0` : `${currentVersionMajor}.${currentVersionMinor + 1}`,
    isActive: false,
    createdAt: new Date(),
  };
  localeStorageSet(SPELLBOOK_LOCALE_STORAGE_KEY_SPELLS, spellsSaved.concat(newSpell));

  // RETURN (for editor)
  console.log("publishSpellLocalStorage", { spellsSaved, newSpell });
  return newSpell;
};
