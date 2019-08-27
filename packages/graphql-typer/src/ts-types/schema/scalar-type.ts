import {GraphQLScalarType} from 'graphql';

import getIdKind from '../../graphql/id-kind';

import {TextBuilder, formatDescription} from '../utils';

const builtins = new Map<string, string>([
  ['Boolean', 'boolean'],
  ['Int', 'number'],
  ['Float', 'number'],
  ['String', 'string'],
  ['ID', 'string'],
]);

export const isBuiltin = (type: GraphQLScalarType) => builtins.has(type.name);

export const defineScalarType = (result: TextBuilder, type: GraphQLScalarType) => {
  if (builtins.has(type.name)) {
    throw new Error(`Cannot write definition for built-in scalar '${type.name}'.`);
  }

  if (type.description) {
    result.appendLine(formatDescription(type.description));
  }

  const idKind = getIdKind(type);
  result
    .append(`export type ${type.name} = `)
    // If this scalar is defined as `@id`, we can marshal it as such.
    // Otherwise, we have no idea what it is.
    .append(idKind ? `IdOf<'${idKind}'>` : 'unknown')
    .appendLine(';');
};

export const writeScalarType = (type: GraphQLScalarType) =>
  builtins.get(type.name) || type.name;
