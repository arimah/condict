import {getTokenPattern} from './shared';

export const enum TokenKind {
  /** Plain text. */
  TEXT = 'text',
  /** An escaped brace ('{{' or '}}'). */
  BRACE = 'brace',
  /** A placeholder (including the surrounding braces). */
  PLACEHOLDER = 'placeholder',
}

export type Token =
  | TextToken
  | BraceToken
  | PlaceholderToken;

export type TextToken = {
  readonly kind: TokenKind.TEXT;
  /** The text value. */
  readonly value: string;
};

export type BraceToken = {
  readonly kind: TokenKind.BRACE;
  /** The escaped brace source text ('{{' or '}}'). */
  readonly value: string;
};

export type PlaceholderToken = {
  readonly kind: TokenKind.PLACEHOLDER;
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
      token = {kind: TokenKind.BRACE, value: m[1]};
    } else if (m[2]) {
      token = {
        kind: TokenKind.PLACEHOLDER,
        value: m[2],
        stem: m[3],
      };
    } else {
      token = {
        kind: TokenKind.TEXT,
        value: m[4],
      };
    }
    result.push(token);
  }

  return result;
};

export default tokenizePattern;
