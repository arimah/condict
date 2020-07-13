import {
  GraphQLField,
  GraphQLEnumType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLUnionType,
  Location,
  FieldNode,
  SelectionNode,
  isListType,
  isNonNullType,
  isScalarType,
  isEnumType,
} from 'graphql';

import formatLoc from '../../format-loc';
import getPermittedEnumValues from '../../graphql/enum-values';

import {
  getBuiltin as getBuiltinScalar,
  TypePosition,
} from '../builtin-scalars';
import {TextBuilder} from '../utils';

import {getObjectLikeInnerType} from './utils';
import {TypeWriterParams, ObjectLikeType} from './types';

export type SelectedField =
  | RegularField
  | TypenameField;

export type RegularField = {
  kind: 'field';
  loc: Location | undefined;
  field: GraphQLField<any, any>;
  subSelections: readonly SelectionNode[] | null;
};

export type TypenameField = {
  kind: '__typename';
  loc: Location | undefined;
  /* The actual object type(s) that this field names. */
  possibleTypes: PossibleTypes;
};

export type PossibleTypes =
  | GraphQLObjectType
  | (() => GraphQLObjectType)
  | readonly GraphQLObjectType[]
  | (() => readonly GraphQLObjectType[]);

type NullableOutputType =
  | GraphQLScalarType
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType
  | GraphQLList<any>;

type InnerType =
  | GraphQLScalarType
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType;

// eslint-disable-next-line prefer-const
let writeFieldType: (
  result: TextBuilder,
  type: GraphQLOutputType,
  writeInnerType: (result: TextBuilder, type: InnerType) => void
) => void;

const writeListType = (
  result: TextBuilder,
  type: GraphQLList<any>,
  writeInnerType: (result: TextBuilder, type: InnerType) => void
) => {
  const isNullable = !isNonNullType(type.ofType);
  if (isNullable) {
    result.append('(');
  }
  writeFieldType(result, type.ofType, writeInnerType);
  result.append(isNullable ? ')[]' : '[]');
};

const writeNullableType = (
  result: TextBuilder,
  type: NullableOutputType,
  writeInnerType: (result: TextBuilder, type: InnerType) => void
) => {
  if (isListType(type)) {
    return writeListType(result, type, writeInnerType);
  }
  // Whatever remains must be a named type, so let's write that.
  writeInnerType(result, type);
};

writeFieldType = (result, type, writeInnerType) => {
  if (isNonNullType(type)) {
    return writeNullableType(
      result,
      type.ofType as NullableOutputType,
      writeInnerType
    );
  }
  writeNullableType(result, type, writeInnerType);
  result.append(' | null');
};

const resolvePossibleTypes = (
  possibleTypes: PossibleTypes
): readonly GraphQLObjectType[] => {
  const types =
    typeof possibleTypes === 'function'
      ? possibleTypes()
      : possibleTypes;
  return Array.isArray(types) ? types : [types];
};

export const writeSelectedFieldType = (
  params: TypeWriterParams,
  result: TextBuilder,
  field: SelectedField
): void => {
  switch (field.kind) {
    case '__typename': {
      const possibleTypes = resolvePossibleTypes(field.possibleTypes);
      result.append(possibleTypes.map(t => `'${t.name}'`).join(' | '));
      break;
    }
    case 'field': {
      writeFieldType(result, field.field.type, (_, type) => {
        if (isScalarType(type)) {
          const builtin = getBuiltinScalar(type, TypePosition.CLIENT_OUTPUT);
          result.append(builtin || params.useType(type));
        } else if (isEnumType(type)) {
          const typeName = params.useType(type);
          const permitted = getPermittedEnumValues(field.field);
          if (permitted) {
            result.append(
              permitted.values
                .map(v => `${typeName}.${v.name}`)
                .join(' | ')
            );
          } else {
            result.append(typeName);
          }
        } else  {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          params.writeSelection(result, type, field.subSelections!);
        }
      });
      break;
    }
  }
};

const validateFieldSelection = (
  parentType: ObjectLikeType,
  field: GraphQLField<any, any>,
  sel: FieldNode
): readonly SelectionNode[] | null => {
  const objectType = getObjectLikeInnerType(field.type);
  if (objectType) {
    if (!sel.selectionSet) {
      throw new Error(
        `${formatLoc(sel.loc)}: The field '${
          parentType.name
        }.${field.name}' requires a selection of subfields`
      );
    }
    return sel.selectionSet.selections;
  } else {
    if (sel.selectionSet) {
      throw new Error(
        `${formatLoc(sel.selectionSet.loc)}: The field '${
          parentType.name
        }.${field.name}' cannot have a selection of subfields`
      );
    }
    return null;
  }
};

export const fieldAlreadyTakenError = (name: string, loc?: Location): Error =>
  new Error(
    `${formatLoc(loc)}: A different field is already selected under the name '${
      name
    }'`
  );

export const selectField = (
  outputFields: Map<string, SelectedField>,
  parentType: ObjectLikeType,
  selection: FieldNode,
  field: GraphQLField<any, any>
): void => {
  const nameNode = selection.alias || selection.name;
  const outputName = nameNode.value;
  const subSelections = validateFieldSelection(parentType, field, selection);

  const output = outputFields.get(outputName);
  if (output) {
    if (output.kind === '__typename' || output.field !== field) {
      throw fieldAlreadyTakenError(outputName, nameNode.loc);
    }

    if (subSelections) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      output.subSelections = output.subSelections!.concat(subSelections);
    }
  } else {
    outputFields.set(outputName, {
      kind: 'field',
      loc: selection.loc,
      field,
      subSelections,
    });
  }
};

export const selectTypename = (
  outputFields: Map<string, SelectedField>,
  selection: FieldNode,
  possibleTypes: PossibleTypes
): void => {
  const nameNode = selection.alias || selection.name;
  const outputName = nameNode.value;

  const output = outputFields.get(outputName);
  if (output) {
    if (output.kind === 'field') {
      throw fieldAlreadyTakenError(outputName, nameNode.loc);
    }

    // If the output field is already __typename, we assume that the previous
    // possibleTypes value will match, and do nothing further.
  } else {
    outputFields.set(outputName, {
      kind: '__typename',
      loc: selection.loc,
      possibleTypes,
    });
  }
};
