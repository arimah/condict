// NOTE: The characters included here MUST match the FTS tokenize options
// from the database schema (../../database/schema).
const TokenPattern = /[\p{L}\p{N}\p{Co}\p{Mc}\p{Mn}']+/u;

const quotePrefixToken = (token: string): string => `"${token}"*`;

const formatFtsQuery = (query: string): string => {
  // Quotes surround literal patterns and phrases; these must match exactly.
  // In the generated FTS query, the tokens within are preserved as written.
  // Non-quoted tokens are quoted for the query and have `*` appended to them,
  // turning them into token prefix matches.
  // For example, the input `"foo, bar" baz` will turn into the FTS query
  // `"foo bar" "baz"*`
  // A quoted phrase is allowed to have a missing end quote, in whith case it
  // extends to the end of the string. This allows quoted phrases to be used
  // as such while the user is still typing them.
  //
  // Capturing groups:
  //   1: content of quoted phrase
  //   2: non-quoted token(s)
  const groupPattern = /"([^"]*)(?:"|$)|([^"\s]+)/g;

  const phrases: string[] = [];

  let m: RegExpExecArray | null;
  while ((m = groupPattern.exec(query)) !== null) {
    if (m[1]) {
      // Quoted group
      // We perform our own tokenization of the phrase, so we can check that
      // it is not empty.

      // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
      const tokens = m[1].match(TokenPattern);
      if (tokens) {
        phrases.push(`"${tokens.join(' ')}"`);
      }
    } else {
      // Non-quoted token(s).
      // Note: we may match multiple tokens here, if the captured text is
      // something like `foo,bar+baz`.

      // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
      const tokens = m[2].match(TokenPattern);
      if (tokens) {
        phrases.push(...tokens.map(quotePrefixToken));
      }
    }
  }

  return phrases.join(' ');
};

export default formatFtsQuery;
