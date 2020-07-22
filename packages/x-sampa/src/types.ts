export interface DataFile {
  readonly replacements: Replacements;
  readonly charData: XsampaChars;
}

export type Replacements = {
  readonly [key: string]: [string, XsampaChar][];
};

export interface XsampaChar {
  readonly base?: true;
  readonly diacritic?: true;
  readonly modifier?: true;
  readonly ipa: string;
  /** Preferred diacritic placements. */
  readonly diacritics?: DiacriticPlacement[];
  /** Alternative placements for diacritics. */
  readonly placements?: AlternativePlacements;
}

export type DiacriticPlacement = 'above' | 'below' | 'after';

export type AlternativePlacements = {
  readonly [P in DiacriticPlacement]?: XsampaChar;
};

export type XsampaChars = {
  readonly [key: string]: XsampaChar;
};
