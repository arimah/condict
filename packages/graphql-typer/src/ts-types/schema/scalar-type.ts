import {GraphQLScalarType} from 'graphql';

import getIdKind from '../../graphql/id-kind';
import getMarshalType, {MarshalType} from '../../graphql/marshal-type';

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

const formatMarshalType = (type: MarshalType): string => {
  switch (type) {
    case MarshalType.INT:
    case MarshalType.FLOAT:
      return 'number';
    case MarshalType.STRING:
      return 'string';
  }
};

export const defineScalarType = (result: TextBuilder, type: GraphQLScalarType) => {
  if (isBuiltin(type)) {
    throw new Error(`Cannot write definition for built-in scalar '${type.name}'.`);
  }

  if (type.description) {
    result.appendLine(formatDescription(type.description));
  }

  const idKind = getIdKind(type);
  const marshalType = getMarshalType(type);
  result
    .append(`export type ${type.name} = `)
    .append(
      // If this scalar is defined as `@id`, we must marshal it as such.
      idKind ? `IdOf<${formatIdKind(idKind)}>` :
      // If there is a `@marshal` directive, we should use that type instead.
      marshalType ? formatMarshalType(marshalType) :
      // Otherwise, we have no idea what it is.
      'unknown'
    )
    .appendLine(';');
};

export const writeScalarType = (type: GraphQLScalarType) =>
  getBuiltin(type, TypePosition.SERVER) || type.name;
