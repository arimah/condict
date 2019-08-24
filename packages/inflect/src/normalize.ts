import {getReplacePattern} from './shared';

/**
 * Normalizes the specified stem name.
 *
 * Stems are normalized by trimming away white space at the start and end,
 * and by collapsing sequences of internal white space to single spaces
 * (U+0020).
 * @param stem The stem to normalize.
 * @return The normalized stem.
 */
export const normalizeStem = (stem: string): string =>
  stem.trim().replace(/\s+/g, ' ');

/**
 * Normalizes an inflection pattern.
 *
 * Patterns are normalized by trimming away white space at the start and
 * end, and by normalizing each stem name inside the pattern (for details,
 * see `normalizeStem`).
 * @param pattern The pattern to normalize.
 * @return The normalized pattern.
 */
export const normalizePattern = (pattern: string): string =>
  pattern
    .replace(
      getReplacePattern(),
      (_, escapedBrace, stem) => {
        if (escapedBrace) {
          return escapedBrace;
        }
        return `{${normalizeStem(stem)}}`;
      }
    )
    .trim();
