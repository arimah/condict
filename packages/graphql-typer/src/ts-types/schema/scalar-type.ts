import {GraphQLScalarType} from 'graphql';

import getIdKind from '../../graphql/id-kind';

import {TextBuilder, formatDescription} from '../utils';
import {TypePosition, isBuiltin, getBuiltin} from '../builtin-scalars';

const formatIdKind = (idKind: string): string => {
  // If the ID kind is all alphanumeric, we never need to do anything fancy.
  if (/^[a-zA-Z0-9_\- ]+$/.test(idKind)) {
    return `'${idKind}'`;
  }
  // A JSON-escaped string should be good enough.
  return JSON.stringify(idKind);
};

export const defineScalarType = (result: TextBuilder, type: GraphQLScalarType) => {
  if (isBuiltin(type)) {
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
    .append(idKind ? `IdOf<${formatIdKind(idKind)}>` : 'unknown')
    .appendLine(';');
};

export const writeScalarType = (type: GraphQLScalarType) =>
  getBuiltin(type, TypePosition.SERVER) || type.name;
