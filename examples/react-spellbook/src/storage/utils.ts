export const SPELLBOOK_LOCALE_STORAGE_KEY_SPELLS = "SpellBook:spells";

export const localeStorageSet = (key: string, data: Record<string, any>) =>
  localStorage.setItem(key, JSON.stringify(data));

export const localeStorageGet = (key: string) => {
  if (typeof key !== "string") return null;
  if (!localStorage.getItem(key)) return null;
  const data = localStorage.getItem(key);
  try {
    // try parsing in case its an obj/arr? if it errs, just return w/e we had
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
};
