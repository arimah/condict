export default (pattern, term, stems) => pattern.replace(
  /(\{\{|\}\})|\{([^{}]+)\}/g,
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
);
