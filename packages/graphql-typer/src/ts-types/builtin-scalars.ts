import {GraphQLScalarType} from 'graphql';

export const enum TypePosition {
  SERVER = 'server',
  CLIENT_OUTPUT = 'output',
  CLIENT_INPUT = 'input',
}

type BuiltinScalar = {
  /** The type as seen by the server. */
  server: string;
  /** Output from the server as received by the client. */
  clientOutput: string;
  /** Input to the server as sent by the client. */
  clientInput: string;
};

const builtins = new Map<string, BuiltinScalar>([
  ['Boolean', {
    server: 'boolean',
    clientOutput: 'boolean',
    clientInput: 'boolean',
  }],
  ['Int', {
    server: 'number',
    clientOutput: 'number',
    clientInput: 'number',
  }],
  ['Float', {
    server: 'number',
    clientOutput: 'number',
    clientInput: 'number',
  }],
  ['String', {
    server: 'string',
    clientOutput: 'string',
    clientInput: 'string',
  }],
  ['ID', {
    server: 'string',
    clientOutput: 'string',
    clientInput: 'string | number',
  }],
]);

export const isBuiltin = (type: GraphQLScalarType): boolean =>
  builtins.has(type.name);

export const getBuiltin = (
  type: GraphQLScalarType,
  position: TypePosition
): string | undefined => {
  const builtin = builtins.get(type.name);
  if (!builtin) {
    return undefined;
  }
  switch (position) {
    case TypePosition.SERVER:
      return builtin.server;
    case TypePosition.CLIENT_OUTPUT:
      return builtin.clientOutput;
    case TypePosition.CLIENT_INPUT:
      return builtin.clientInput;
  }
};
