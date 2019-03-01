const {
  isCondictLink,
  parseCondictLink,
} = require('../../rich-text/condict-link');

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

    if (isCondictLink(inline.linkTarget)) {
      const link = parseCondictLink(inline.linkTarget);
      const table = linkTargetTable[link.type];
      inline.linkTarget = `condict://${link.type}/${newIds[table].get(link.id)}`;
    }
  });
};

module.exports = {
  inlineElementReferences,
  updateInlineReferences,
};
