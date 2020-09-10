import {GraphQLScalarType} from 'graphql';

export type TypePosition =
  /** The type as seen by the server. */
  | 'server'
  /** Input to the server as sent in a request by the client. */
  | 'clientRequest'
  /** Output from the server as sent to the client in a response. */
  | 'clientResponse';

type BuiltinScalar = {
  /** The type as seen by the server. */
  server: string;
  /** Output from the server as received by the client. */
  clientRequest: string;
  /** Input to the server as sent by the client. */
  clientResponse: string;
};

const builtins = new Map<string, BuiltinScalar>([
  ['Boolean', {
    server: 'boolean',
    clientRequest: 'boolean',
    clientResponse: 'boolean',
  }],
  ['Int', {
    server: 'number',
    clientRequest: 'number',
    clientResponse: 'number',
  }],
  ['Float', {
    server: 'number',
    clientRequest: 'number',
    clientResponse: 'number',
  }],
  ['String', {
    server: 'string',
    clientRequest: 'string',
    clientResponse: 'string',
  }],
  ['ID', {
    server: 'string',
    clientRequest: 'string',
    clientResponse: 'string | number',
  }],
]);

export const isBuiltin = (type: GraphQLScalarType): boolean =>
  builtins.has(type.name);

export const getBuiltin = (
  type: GraphQLScalarType,
  position: TypePosition
): string | undefined => {
  const builtin = builtins.get(type.name);
  return builtin && builtin[position];
};
