import {BlockElement, CustomText} from '@condict/rich-text-editor';
import {DefinitionTable} from '@condict/table-editor';

import {
  CustomInflectedFormInput,
  InflectedFormId,
  StemInput,
  DefinitionFieldInput,
} from '../graphql';
import {DefinitionFieldData} from '../forms';

export const formatCustomForms = (
  table: DefinitionTable
): CustomInflectedFormInput[] =>
  Array.from(DefinitionTable.exportCustomForms(table), ([id, value]) => ({
    inflectedFormId: id as InflectedFormId,
    value,
  }));

export const formatStems = (stems: Map<string, string>): StemInput[] =>
  Array.from(stems, ([name, value]) => ({name, value}));

export const formatFields = (
  fields: DefinitionFieldData[]
): DefinitionFieldInput[] =>
  fields.map<DefinitionFieldInput>(f => {
    switch (f.type) {
      case 'boolean':
        return {fieldId: f.fieldId, booleanValue: f.value};
      case 'list':
        return {fieldId: f.fieldId, listValues: f.value};
      case 'plainText':
        return {fieldId: f.fieldId, textValue: f.value};
    }
  });

export const hasTableCaption = (caption: BlockElement[]): boolean =>
  caption[0].children.some(c => !!(c as CustomText).text);
