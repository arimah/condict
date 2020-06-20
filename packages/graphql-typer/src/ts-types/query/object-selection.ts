import {
  GraphQLObjectType,
  SelectionNode,
} from 'graphql';

import {TextBuilder} from '../utils';

import {
  SelectedField,
  selectField,
  selectTypename,
  writeSelectedFieldType,
} from './selected-field';
import {
  SelectionInclusion,
  isSelectionIncluded,
  validateFragmentType,
} from './utils';
import {TypeWriterParams} from './types';

export const collectFields = (
  params: TypeWriterParams,
  type: GraphQLObjectType,
  outputFields: Map<string, SelectedField>,
  selections: readonly SelectionNode[]
): void => {
  for (const sel of selections) {
    const included = isSelectionIncluded(sel);
    if (included === SelectionInclusion.DEPENDS) {
      throw new Error(`Conditional fields are not yet supported`);
    }
    if (included === SelectionInclusion.SKIP) {
      continue;
    }

    switch (sel.kind) {
      case 'Field': {
        if (sel.name.value === '__typename') {
          selectTypename(outputFields, sel, type);
        } else {
          const field = type.getFields()[sel.name.value];
          if (!field) {
            throw new Error(`Cannot select unknown field: ${sel.name.value}`);
          }
          selectField(outputFields, type, sel, field);
        }
        break;
      }
      case 'FragmentSpread': {
        const fragment = params.useFragment(sel.name.value);
        validateFragmentType(
          params,
          [type],
          fragment.typeCondition,
          fragment.name.value
        );
        collectFields(
          params,
          type,
          outputFields,
          fragment.selectionSet.selections
        );
        break;
      }
      case 'InlineFragment': {
        if (sel.typeCondition) {
          validateFragmentType(params, [type], sel.typeCondition, null);
        }
        collectFields(
          params,
          type,
          outputFields,
          sel.selectionSet.selections
        );
        break;
      }
    }
  }
};

const writeObjectTypeSelection = (
  params: TypeWriterParams,
  result: TextBuilder,
  type: GraphQLObjectType,
  selections: readonly SelectionNode[]
): void => {
  const outputFields = new Map<string, SelectedField>();

  collectFields(params, type, outputFields, selections);

  result
    .appendLine('{')
    .indented(() => {
      for (const [name, field] of outputFields) {
        result.append(`${name}: `);
        writeSelectedFieldType(params, result, field);
        result.appendLine(';');
      }
    })
    .append('}');
};

export default writeObjectTypeSelection;
