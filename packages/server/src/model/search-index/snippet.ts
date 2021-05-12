// Characters from the Private Use Area are employed as markers. The code
// points chosen are totally arbitrary and basically just an attempt at
// picking something that is likely to be unique.

/**
 * Indicates that the beginning or end of a snippet is partial; that is, there
 * is text beyond the snippet.
 */
export const Partial = '\uE642\uEA00';

/** Indicates the start of a matching phrase. */
export const MatchStart = '\uE642\uEA01';

/** Indicates the end of a matching phrase. */
export const MatchEnd = '\uE642\uEA02';
