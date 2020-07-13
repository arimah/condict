import {InlineElementJson, CondictLinkType} from '../../rich-text/types';
import {isCondictLink, parseCondictLink} from '../../rich-text/condict-link';

import {ForeignKeyContentRef, NewIdMap} from './types';

// Columns that can be referenced by inline elements (inside formatted text).
export const inlineElementReferences: ForeignKeyContentRef[] = [
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

const linkTargetTable: Record<CondictLinkType, string> = {
  language: 'languages',
  lemma: 'lemmas',
  definition: 'definitions',
  'part-of-speech': 'parts_of_speech',
};

export const updateInlineReferences = (
  inlines: InlineElementJson[] | undefined,
  newIds: NewIdMap
): void => {
  if (!inlines) {
    return;
  }

  for (const inline of inlines) {
    if (!InlineElementJson.isLink(inline)) {
      continue;
    }

    if (isCondictLink(inline.linkTarget)) {
      const link = parseCondictLink(inline.linkTarget);
      const table = linkTargetTable[link.type];
      inline.linkTarget = `condict://${link.type}/${newIds[table].get(link.id)}`;
    }
  }
};
