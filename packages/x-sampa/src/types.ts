export type DataFile = {
  readonly replacements: Replacements;
  readonly charData: XsampaChars;
};

export type Replacements = {
  readonly [key: string]: [string, XsampaChar][];
};

export type XsampaChar = {
  readonly base?: true;
  readonly diacritic?: true;
  readonly modifier?: true;
  readonly ipa: string;
  /** The length of the X-SAMPA string that maps to this replacement. */
  readonly xsLength?: number;
  /** Preferred diacritic placements. */
  readonly diacritics?: DiacriticPlacement[];
  /** Alternative placements for diacritics. */
  readonly placements?: AlternativePlacements;
};

export type DiacriticPlacement = 'above' | 'below' | 'after';

export type AlternativePlacements = {
  readonly [P in DiacriticPlacement]?: XsampaChar;
};

export type XsampaChars = {
  readonly [key: string]: XsampaChar;
};
