import {GraphQLScalarType} from 'graphql';

import getIdKind from '../graphql/id-kind';

import {formatDescription} from './utils';

type BuiltinScalar = {
  output: string;
  input: string;
}

const builtins = new Map<string, BuiltinScalar>([
  ['Boolean', {output: 'boolean', input: 'boolean'}],
  ['Int', {output: 'number', input: 'number'}],
  ['Float', {output: 'number', input: 'number'}],
  ['String', {output: 'string', input: 'string'}],
  ['ID', {output: 'string', input: 'string | number'}],
]);

export const isBuiltin = (type: GraphQLScalarType) => builtins.has(type.name);

export const defineScalarType = (type: GraphQLScalarType): string => {
  if (builtins.has(type.name)) {
    throw new Error(`Cannot write definition for built-in scalar '${type.name}'.`);
  }

  const desc = type.description
    ? formatDescription(type.description) + '\n'
    : '';

  // If this scalar is defined as `@id`, we can marshal it as such.
  const idKind = getIdKind(type);
  if (idKind) {
    return `${desc}export type ${type.name} = IdOf<'${idKind}'>;`;
  }

  // Otherwise, we have no idea what it is.
  return `${desc}export type ${type.name} = unknown;`;
};

export const writeScalarType = (type: GraphQLScalarType, input: boolean) => {
  const builtin = builtins.get(type.name);
  if (builtin) {
    return input ? builtin.input : builtin.output;
  }
  return type.name;
};
