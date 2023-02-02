export type TOutlineSpellConfig = {
  title: string;
  spellKey: string;
  link: string;
};

export type TOutlineSections = {
  sectionTitle: string;
  spells: TOutlineSpellConfig[];
}[];
