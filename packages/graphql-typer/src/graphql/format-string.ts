/**
 * StringCharacter :: EscapedCharacter
 * EscapedCharacter :: one of
 *   "  \  /  b  f  n  r  t
 *
 * But note that we never even attempt to generate `\/`, so it is not
 * represented in the table below.
 */
const escapes = new Map<string, string>([
  ['"', '\\"'],
  ['\\', '\\\\'],
  ['\r', '\\r'],
  ['\n', '\\n'],
  ['\t', '\\t'],
  ['\f', '\\f'],
  ['\b', '\\b'],
]);

/**
 * StringCharacter :: \u EscapedUnicode
 * EscapedUnicode ::
 *   /[0-9A-Fa-f]{4}/
 */
const escapeUnicode = (ch: string) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const codePoint = ch.codePointAt(0)!;
  return codePoint.toString(16).padStart(4, '0');
};

/*
 * StringCharacter :: SourceCharacter but not " or \ or LineTerminator
 * SourceCharacter ::
 *   /[\u0009\u000A\u000D\u0020-\uFFFF]/
 * LineTerminator ::
 *   New Line (U+000A)
 *   Carriage Return (U+000D) [lookahead ≠ New Line (U+000A)]
 *   Carriage Return (U+000D) New Line (U+000A)
 *
 * Basically, we only really need to escape U+0000 to U+001F as well as
 * " and \.
 */
const escapeString = (value: string) =>
  value.replace(
    // eslint-disable-next-line no-control-regex
    /[\u0000-\u001F\\"]/g,
    ch => escapes.get(ch) ?? escapeUnicode(ch)
  );

const formatString = (value: string): string => {
  const escaped = escapeString(value);
  return `"${escaped}"`;
};

export default formatString;
