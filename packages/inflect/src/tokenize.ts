import {getTokenPattern} from './shared';

export type Token =
  | TextToken
  | BraceToken
  | PlaceholderToken;

export type TextToken = {
  readonly kind: 'text';
  /** The text value. */
  readonly value: string;
};

export type BraceToken = {
  readonly kind: 'brace';
  /** The escaped brace source text ('{{' or '}}'). */
  readonly value: string;
};

export type PlaceholderToken = {
  readonly kind: 'placeholder';
  /** The placeholder source text (including the surrounding braces). */
  readonly value: string;
  /** The (raw, non-normalized) stem name. */
  readonly stem: string;
};

/**
 * Tokenizes the specified pattern.
 * @param pattern The pattern to tokenize.
 * @return An array of tokens
 */
const tokenizePattern = (pattern: string): Token[] => {
  const result: Token[] = [];

  const rx = getTokenPattern();
  let m;
  while ((m = rx.exec(pattern)) !== null) {
    let token: Token;
    if (m[1]) {
      token = {kind: 'brace', value: m[1]};
    } else if (m[2]) {
      token = {kind: 'placeholder', value: m[2], stem: m[3]};
    } else {
      token = {kind: 'text', value: m[4]};
    }
    result.push(token);
  }

  return result;
};

export default tokenizePattern;
