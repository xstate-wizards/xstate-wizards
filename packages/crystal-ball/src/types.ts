export type TCrystalBallViewSectionSpellConfig = {
  title: string;
  spellKey: string;
  link: string;
};

export type TCrystalBallViewSections = {
  sectionTitle: string;
  spells: TCrystalBallViewSectionSpellConfig[];
}[];
