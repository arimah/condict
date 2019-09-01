import {
  GraphQLField,
  GraphQLEnumType,
  GraphQLEnumValue,
  GraphQLType,
  ValueNode,
  isEnumType,
  isNonNullType,
} from 'graphql';

import {
  assertIsList,
  assertIsString,
  getDirective,
  getArgument,
} from './helpers';

export type PermittedEnumValues = {
  type: GraphQLEnumType;
  values: GraphQLEnumValue[];
  allowNull: boolean;
};

type EnumTypeInfo = {
  type: GraphQLEnumType;
  allowNull: boolean;
}

type RestrictDirective = {
  only?: ValueNode;
  not?: ValueNode;
};

const getEnumType = (type: GraphQLType): EnumTypeInfo | null => {
  if (isNonNullType(type) && isEnumType(type.ofType)) {
    return {type: type.ofType, allowNull: false};
  }
  if (isEnumType(type)) {
    return {type, allowNull: true};
  }
  return null;
};

const getRestrictDirective = (
  field: GraphQLField<any, any>
): RestrictDirective | null => {
  const restrictDirective =
    field.astNode &&
    getDirective(field.astNode, 'restrict');
  if (!restrictDirective) {
    // Field is not restricted, so anything goes.
    return null;
  }

  const onlyArgument = getArgument(restrictDirective, 'only');
  const notArgument = getArgument(restrictDirective, 'not');

  if (onlyArgument && notArgument) {
    throw new Error(`Cannot mix 'only:' and 'not:' in @restrict directive`);
  }

  return {
    only: onlyArgument && onlyArgument.value,
    not: notArgument && notArgument.value,
  };
};

const getPermittedEnumValues = (
  field: GraphQLField<any, any>
): PermittedEnumValues | null => {
  const enumInfo = getEnumType(field.type);
  if (!enumInfo) {
    // @restrict only applies to fields of enum types.
    return null;
  }

  const restrict = getRestrictDirective(field);
  if (!restrict) {
    // Enum value is not restricted.
    return null;
  }

  let values: GraphQLEnumValue[];
  if (restrict.only) {
    values =
      assertIsList(restrict.only)
        .values
        .map(assertIsString)
        .map(({value: name}) => {
          const value = enumInfo.type.getValue(name);
          if (!value) {
            throw new Error(`Unknown enum value: ${name}`);
          }
          return value;
        });
  } else if (restrict.not) {
    values =
      assertIsList(restrict.not)
        .values
        .map(assertIsString)
        .reduce(
          (values, {value: name}) => {
            // We have to verify that the name actually refers to a known value.
            if (!enumInfo.type.getValue(name)) {
              throw new Error(`Unknown enum value: ${name}`);
            }
            return values.filter(v => v.name !== name);
          },
          enumInfo.type.getValues()
        );
  } else {
    throw new Error(`@restrict directive must have either 'only:' or 'not:'`);
  }
  return {
    type: enumInfo.type,
    values,
    allowNull: enumInfo.allowNull,
  };
};

export default getPermittedEnumValues;
