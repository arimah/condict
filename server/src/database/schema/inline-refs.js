// Columns that can be referenced by inline elements (inside formatted text).
const inlineElementReferences = [
  {
    table: 'languages',
    column: 'id',
  },
  {
    table: 'lemmas',
    column: 'id',
  },
  {
    table: 'definitions',
    column: 'id',
  },
  {
    table: 'parts_of_speech',
    column: 'id',
  },
];

const linkTargetRegex =
  /^condict:\/\/(language|lemma|definition|part-of-speech)\/([0-9]+)$/;

const linkTargetTable = {
  language: 'languages',
  lemma: 'lemmas',
  definition: 'definitions',
  'part-of-speech': 'parts_of_speech',
};

const updateInlineReferences = (inlines, newIds) => {
  if (!inlines) {
    return;
  }
  inlines.forEach(inline => {
    if (inline.kind !== 'LINK') {
      return;
    }

    const m = linkTargetRegex.exec(inline.linkTarget);
    if (m) {
      const table = linkTargetTable[m[1]];
      const id = m[2] | 0;
      inline.linkTarget = `condict://${m[1]}/${newIds[table].get(id)}`;
    }
  });
};

module.exports = {
  inlineElementReferences,
  updateInlineReferences,
};
