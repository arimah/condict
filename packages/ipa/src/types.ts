export interface DataFile {
  readonly chars: IpaChar[];
  readonly groups: RawGroup[];
  readonly searchTree: IpaSearchNode[];
}

export interface IpaChar {
  /** The IPA character to be inserted. */
  readonly input: string;
  /**
   * The display text of the character. For diacritics, this includes a
   * placeholder character.
   */
  readonly display: string;
  /** The name of the IPA character. */
  readonly name: string;
  /** The words in the name, equal to the name split on ' '. */
  readonly nameWords: string[];
}

export interface RawGroup {
  /** The name of the group. */
  readonly name: string;
  /** Character indexes */
  readonly members: number[];
  /**
   * Index of the base character; that is, the character that the group's
   * members are visually or semantically similar to. If the group has no base,
   * this value is undefined.
   */
  readonly base?: number;
}

export interface IpaSearchNode {
  /** The substring that leads to this node. */
  readonly path: string;
  /** The full term matched by leaves in this node (when `leaves` is defined). */
  readonly term?: string;
  /** Tuples of [character index, score] */
  readonly leaves?: [number, number][];
  readonly branches?: IpaSearchNode[];
}

export interface IpaGroup {
  /** The name of the group. */
  readonly name: string;
  /**
   * The base character; that is, the character that the group's members are
   * visuall or semantically similar to. If the group has no base, this value
   * is null.
   */
  readonly base: IpaChar | null;
  /**
   * The characters of the group, not including the base character.
   */
  readonly members: IpaChar[];
}

/** An IPA character that matches a query, plus extended match details. */
export type Match = [IpaChar, MatchInfo];

/** Detailed information about an IPA character search result. */
export interface MatchInfo {
  /** The total score of the match. Higher score = higher relevance. */
  totalScore: number;
  /** The terms that were matched by the query. */
  terms: TermMatch[];
}

/** A matched term. */
export interface TermMatch {
  /** The term that matched a word in the search query. */
  term: string;
  /** The query word that the term matched. */
  query: string;
  /** The score of the match. Higher score = better match. */
  score: number;
}
