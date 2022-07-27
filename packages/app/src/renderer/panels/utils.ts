import {BlockElement, CustomText} from '@condict/rich-text-editor';
import {DefinitionTable} from '@condict/table-editor';

import {CustomInflectedFormInput, InflectedFormId, StemInput} from '../graphql';

export const formatCustomForms = (
  table: DefinitionTable
): CustomInflectedFormInput[] =>
  Array.from(DefinitionTable.exportCustomForms(table), ([id, value]) => ({
    inflectedFormId: id as InflectedFormId,
    value,
  }));

export const formatStems = (stems: Map<string, string>): StemInput[] =>
  Array.from(stems, ([name, value]) => ({name, value}));

export const hasTableCaption = (caption: BlockElement[]): boolean =>
  caption[0].children.some(c => !!(c as CustomText).text);
