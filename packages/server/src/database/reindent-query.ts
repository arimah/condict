/**
 * This function reindents an SQL query (although it'll work on any string).
 * Its purpose is to create a cleaner, more easily digested log, by normalizing
 * queries to remove redundant leading and trailing white space.
 */
export default (query: string): string => {
  let indent: string | null = null;
  const lines = query.split('\n').filter(line => {
    if (indent !== null) {
      return true;
    }

    if (/^\s*$/.test(line)) {
      // This line contains nothing but white space; we can remove it.
      return false;
    }

    // This is the first non-empty line. Find its indentation. Every subsequent
    // line is indented relative to it.
    indent = (line.match(/^\s*/) as RegExpMatchArray)[0];
    return true;
  });

  // No need to escape the regex; it's all white space.
  const indentRegex = new RegExp(`^${indent}`);
  return lines
    .map(line => line.replace(indentRegex, ''))
    .join('\n')
    .trimRight();
};
