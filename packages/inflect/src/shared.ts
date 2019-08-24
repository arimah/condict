/**
 * Gets a regular expression that can be used used for replacing placeholders
 * and escaped braces inside a string.
 *
 * Capture groups:
 *   1: An escaped brace ('{{' or '}}').
 *   2: A stem name (non-normalized). The stem name never contains '{' or '}'.
 */
export const getReplacePattern = () => /(\{\{|\}\})|\{([^{}]+)\}/g;

/**
 * Gets a regular expression that can be used for tokenizing the contents of
 * an inflection pattern.
 *
 * Capture groups:
 *   1: An escaped brace ('{{' or '}}').
 *   2: A placeholder, including the surrounding braces.
 *   3: The stem name inside the placeholder. The stem name never contains '{'
 *      or '}'.
 *   4: Plain text content. Note that '}' does not have to be escaped, meaning
 *      that this value may contain single '}' characters.
 */
export const getTokenPattern = () =>
  /(\{\{|\}\})|(\{([^{}]+)\})|((?:[^{}]|\}(?!\}))+)/g;
