import {
  InlineKind,
  InlineElement,
  CondictLinkTarget,
} from '../../rich-text/types';
import {isCondictLink, parseCondictLink} from '../../rich-text/condict-link';

import {ForeignKeyRef, NewIdMap} from './types';

// Columns that can be referenced by inline elements (inside formatted text).
export const inlineElementReferences: ForeignKeyRef[] = [
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

const linkTargetTable: Record<CondictLinkTarget, string> = {
  language: 'languages',
  lemma: 'lemmas',
  definition: 'definitions',
  'part-of-speech': 'parts_of_speech',
};

export const updateInlineReferences = (
  inlines: InlineElement[] | undefined | null,
  newIds: NewIdMap
) => {
  if (!inlines) {
    return;
  }

  inlines.forEach(inline => {
    if (inline.kind !== InlineKind.LINK) {
      return;
    }

    if (isCondictLink(inline.linkTarget)) {
      const link = parseCondictLink(inline.linkTarget);
      const table = linkTargetTable[link.type];
      inline.linkTarget = `condict://${link.type}/${newIds[table].get(link.id)}`;
    }
  });
};
