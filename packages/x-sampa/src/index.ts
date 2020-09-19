import {
  replacements as RawReplacements,
  charData as RawCharData,
} from './data.json';
import {Replacements, XsampaChar, XsampaChars} from './types';

interface CharMatch {
  readonly char: XsampaChar,
  readonly length: number,
}

interface Modifier {
  readonly originalIndex: number;
  readonly char: XsampaChar;
}

// FIXME: Figure out a way to make the `as unknown` cast unnecessary,
// if at all possible.
const Replacements = new Map(Object.entries(
  RawReplacements as unknown as Replacements
));
const CharData = new Map(Object.entries(RawCharData as XsampaChars));

const substringEquals = (
  string: string,
  startIndex: number,
  substring: string
): boolean => {
  if (string.length - startIndex < substring.length) {
    return false;
  }

  for (let i = 0; i < substring.length; i++) {
    if (string[startIndex + i] !== substring[i]) {
      return false;
    }
  }

  return true;
};

/**
 * Determines whether the specified index is at the end of the input or at a
 * space character.
 */
const isEndOrSpace = (xsampa: string, index: number): boolean =>
  index === xsampa.length || xsampa[index] == ' ';

const matchChar = (xsampa: string, index: number): CharMatch => {
  const nextChar = xsampa[index];

  // Special case: `,` at EOL or before a space is treated literally, to make
  // situations like `wVn, tu:, Tr\i:` more ergonomic.
  if (nextChar === ',' && isEndOrSpace(xsampa, index + 1)) {
    return {char: {ipa: nextChar, base: true}, length: 1};
  }

  const replacements = Replacements.get(nextChar);
  if (replacements) {
    // Let's find the longest match we can. Replacements are ordered by input
    // string length, with the longest first.
    for (let i = 0; i < replacements.length; i++) {
      const [input, char] = replacements[i];
      if (substringEquals(xsampa, index, input)) {
        return {char, length: input.length};
      }
    }
  }

  const char = CharData.get(nextChar);
  if (char) {
    return {char, length: 1};
  }

  // If we couldn't match it against anything, treat it like
  // an unknown base character.
  return {char: {ipa: nextChar, base: true}, length: 1};
};

const placeModifier = (base: XsampaChar, modifier: XsampaChar): XsampaChar => {
  // If the modifier is not a diacritic or it only has a single placement,
  // there are no alternatives, so just return the modifier. Likewise, if
  // the base has no preferred placements, we always use the default.
  if (!modifier.diacritic || !modifier.placements || !base.diacritics) {
    return modifier;
  }

  for (let i = 0; i < base.diacritics.length; i++) {
    const place = base.diacritics[i];
    const placement = modifier.placements[place];
    if (placement) {
      return placement;
    }
  }

  // Unable to satisfy preferred placement - return default.
  return modifier;
};

const flush = (base: XsampaChar, modifiers: Modifier[]): string => {
  if (modifiers.length === 0) {
    return base.ipa;
  }

  // Diacritics come before modifiers, but preserve the original order!
  modifiers.sort((a, b) =>
    (+!a.char.diacritic - +!b.char.diacritic) ||
    (a.originalIndex - b.originalIndex)
  );
  const result = base.ipa + modifiers.map(m => m.char.ipa).join('');

  // Enable array instance reuse - slightly naughty, but memory-efficient.
  modifiers.length = 0;

  return result;
};

const convert = (xsampa: string): string => {
  let ipa = '';

  let base: XsampaChar | null = null;
  const modifiers: Modifier[] = [];
  for (let i = 0; i < xsampa.length; ) {
    // `*` is the escape character.
    if (xsampa[i] === '*') {
      if (base !== null) {
        ipa += flush(base, modifiers);
        base = null;
      }

      i++;
      // At the end of the string and before a space, return the '*'. There is
      // nothing visible to escape.
      if (isEndOrSpace(xsampa, i)) {
        ipa += '*';
      } else {
        ipa += xsampa[i++];
      }
      continue;
    }

    const {char, length} = matchChar(xsampa, i);

    if (char.base) {
      if (base !== null) {
        ipa += flush(base, modifiers);
      }
      base = char;
    } else if (base) {
      // If there is a base and char is not a base, char must be a modifier
      // or diacritic. If it's a diacritic, we need to figure out its placement;
      // if it's a non-diacritic modifier, we can add it as-is.
      const modifier = placeModifier(base, char);
      modifiers.push({
        originalIndex: modifiers.length,
        char: modifier,
      });
    } else {
      // char is a modifier or diacritic, but there is no current base, e.g. the
      // input starts with "_k". Just add the IPA transliteration and move on.
      ipa += char.ipa;
    }

    i += length;
  }

  if (base !== null) {
    ipa += flush(base, modifiers);
  }

  return ipa;
};

export default convert;
