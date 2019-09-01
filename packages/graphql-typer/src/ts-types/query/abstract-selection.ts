import {
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLUnionType,
  SelectionNode,
  assertObjectType,
  isUnionType,
} from 'graphql';

import {TextBuilder} from '../utils';

import {
  SelectedField,
  selectField,
  selectTypename,
  writeSelectedFieldType,
  fieldAlreadyTakenError,
} from './selected-field';
import {collectFields as collectObjectFields} from './object-selection';
import {
  SelectionInclusion,
  isSelectionIncluded,
  validateFragmentType,
} from './utils';
import {TypeWriterParams} from './types';

type OutputFields = {
  type: GraphQLInterfaceType | GraphQLUnionType;
  possibleTypes: readonly GraphQLObjectType[];
  common: Map<string, SelectedField>;
  specialized: Map<string, SpecializedTypeFields>;
};

type SpecializedTypeFields = {
  type: GraphQLObjectType;
  fields: Map<string, SelectedField>;
};

const getSpecializedTypeFields = (
  allFields: Map<string, SpecializedTypeFields>,
  type: GraphQLNamedType
): SpecializedTypeFields => {
  const objectType = assertObjectType(type);

  let result = allFields.get(objectType.name);
  if (!result) {
    result = {
      type: objectType,
      fields: new Map<string, SelectedField>(),
    };
    allFields.set(objectType.name, result);
  }
  return result;
};

const getValidFragmentTypes = (outputFields: OutputFields) =>
  isUnionType(outputFields.type)
    ? outputFields.possibleTypes
    : [outputFields.type, ...outputFields.possibleTypes];

let collectFields: (
  params: TypeWriterParams,
  outputFields: OutputFields,
  selections: readonly SelectionNode[]
) => void;

const collectFragmentFields = (
  params: TypeWriterParams,
  outputFields: OutputFields,
  fragmentType: GraphQLNamedType,
  // graphql-disable-next-line no-shadow
  selections: readonly SelectionNode[]
) => {
  if (fragmentType === outputFields.type) {
    // A selection on the interface type itself
    collectFields(params, outputFields, selections);
  } else {
    // A selection on one of the interface's implementing types.
    const fields = getSpecializedTypeFields(
      outputFields.specialized,
      fragmentType
    );
    collectObjectFields(
      params,
      fields.type,
      fields.fields,
      selections
    );
  }
};

collectFields = (params, outputFields, selections) => {
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
          selectTypename(
            outputFields.common,
            sel,
            () => outputFields.possibleTypes.filter(
              t => !outputFields.specialized.has(t.name)
            )
          );
        } else if (isUnionType(outputFields.type)) {
          throw new Error(`Cannot select field '${sel.name.value}' on a union type`);
        } else {
          const field = outputFields.type.getFields()[sel.name.value];
          if (!field) {
            throw new Error(`Cannot select unknown field: ${sel.name.value}`);
          }
          selectField(outputFields.common, outputFields.type, sel, field);
        }
        break;
      }
      case 'FragmentSpread': {
        const fragment = params.useFragment(sel.name.value);
        const fragmentType = validateFragmentType(
          params,
          getValidFragmentTypes(outputFields),
          fragment.typeCondition,
          fragment.name.value
        );
        collectFragmentFields(
          params,
          outputFields,
          fragmentType,
          fragment.selectionSet.selections
        );
        break;
      }
      case 'InlineFragment': {
        const fragmentType =
          sel.typeCondition
            ? validateFragmentType(
              params,
              getValidFragmentTypes(outputFields),
              sel.typeCondition,
              null
            )
            : outputFields.type;
        collectFragmentFields(
          params,
          outputFields,
          fragmentType,
          sel.selectionSet.selections
        );
        break;
      }
    }
  }
};

const mergeCommonFields = (
  common: Map<string, SelectedField>,
  specialized: Map<string, SpecializedTypeFields>,
  possibleTypes: readonly GraphQLObjectType[]
) => {
  const allSelections: Map<string, SelectedField>[] = [];

  for (const fields of specialized.values()) {
    const result = new Map<string, SelectedField>();

    for (const [name, field] of common) {
      switch (field.kind) {
        // If __typename is selected as a common field, transform it into
        // the appropriate type.
        case '__typename':
          result.set(name, {
            kind: '__typename',
            possibleTypes: fields.type,
          });
          break;
        // If it's a regular field, find the corresponding the field on the
        // implementing type. This ensures we can support custom directives
        // such as @restrict.
        case 'field': {
          const actualField = fields.type.getFields()[field.field.name];
          result.set(name, {
            kind: 'field',
            field: actualField,
            subSelections: field.subSelections,
          });
          break;
        }
      }
    }

    for (const [name, field] of fields.fields) {
      const prev = result.get(name);
      switch (field.kind) {
        case '__typename':
          if (prev) {
            if (prev.kind !== '__typename') {
              throw fieldAlreadyTakenError(name);
            }
          } else {
            result.set(name, {
              kind: '__typename',
              possibleTypes: fields.type,
            });
          }
          break;
        case 'field':
          if (prev) {
            if (prev.kind !== 'field' || prev.field !== field.field) {
              throw fieldAlreadyTakenError(name);
            }
            if (prev.subSelections && field.subSelections) {
              result.set(name, {
                kind: 'field',
                field: field.field,
                subSelections: [
                  ...prev.subSelections,
                  ...field.subSelections,
                ],
              });
            }
          } else {
            result.set(name, {
              kind: 'field',
              field: field.field,
              subSelections: field.subSelections,
            });
          }
          break;
      }
    }

    allSelections.push(result);
  }

  if (specialized.size < possibleTypes.length) {
    // Some types are not covered by specialization. Add all common fields
    // to the end. If the __typename field is selected, it automatically
    // gets the right value.
    allSelections.push(common);
  }

  return allSelections;
};

const writeAbstractTypeSelection = (
  params: TypeWriterParams,
  result: TextBuilder,
  type: GraphQLInterfaceType | GraphQLUnionType,
  selections: readonly SelectionNode[]
) => {
  const outputFields: OutputFields = {
    type,
    possibleTypes: params.schema.getPossibleTypes(type),
    common: new Map<string, SelectedField>(),
    specialized: new Map<string, SpecializedTypeFields>(),
  };

  collectFields(params, outputFields, selections);

  const allSelections = mergeCommonFields(
    outputFields.common,
    outputFields.specialized,
    outputFields.possibleTypes
  );

  // Put parentheses around the type just in case it has to appear inside
  // a list type or somesuch.
  result.append('(');
  allSelections.forEach((sel, index) => {
    if (index > 0) {
      result.append(' | ');
    }

    // The selection could be empty if there are common fields and not
    // all possible types are covered by fragment specializations. In
    // that case, we must output an empty object as the last possibility.
    if (sel.size === 0) {
      result.append('{}');
      return;
    }

    result.appendLine('{')
      .indented(() => {
        for (const [name, field] of sel) {
          result.append(`${name}: `);
          writeSelectedFieldType(params, result, field);
          result.appendLine(';');
        }
      })
      .append('}');
  });
  result.append(')');
};

export default writeAbstractTypeSelection;
