import {getReplacePattern} from './shared';

export type StemMap = {
  has(key: string): boolean;
  get(key: string): string | undefined;
};

/**
 * Inflects a word according to the specified pattern.
 *
 * NOTE: This function *assumes* that the pattern has been normalized. Stems are
 * looked up with exactly the values present in the pattern. If you don't know
 * whether the pattern is normalized, call `normalizePattern` on it first.
 * @param pattern The inflection pattern, which may contain placeholders like
 *        `{~}` or `{Plural root}`.
 * @param term The lemma form of the word. This form is used as the substitution
 *        for `{~}` placeholders, as well as for any stem that is not present in
 *        the `stems` map.
 * @param stems A map-like value that contains the word's stems.
 * @return The inflected word.
 */
const inflectWord = (pattern: string, term: string, stems: StemMap): string =>
  pattern
    .replace(
      getReplacePattern(),
      (_, escapedBrace, stem) => {
        if (escapedBrace) {
          return escapedBrace[0];
        }
        if (stem === '~') {
          return term;
        }
        // Note: Don't try to "simplify" this to `stems.get(stem) || term`.
        // You are allowed to specify empty stem values, e.g. for null affixes.
        return stems.has(stem) ? stems.get(stem) : term;
      }
    )
    .trim();

export default inflectWord;
