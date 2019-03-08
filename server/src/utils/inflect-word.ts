// Inflection patterns contain placeholders like "{root}", which are replaced
// by the corresponding stem of that name. If there is no such stem, the lemma
// form is used. The special stem name "~" always refers to the lemma form.
// To escape "{", it is simply doubled. To avoid ambiguity, the stem name is
// not permitted to contain "{" or "}".

export default (term: string, stems: Map<string, string>, pattern: string) =>
  pattern.replace(
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
