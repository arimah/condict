import {
  GraphQLSchema,
  GraphQLScalarSerializer,
  GraphQLScalarValueParser,
  GraphQLScalarLiteralParser,
  Kind,
} from 'graphql';
import {MapperKind, mapSchema, getDirectives} from '@graphql-tools/utils';

import {MarshalType} from '../types';

interface MarshalImpl {
  readonly serialize: GraphQLScalarSerializer<any>;
  readonly parseValue: GraphQLScalarValueParser<any>;
  readonly parseLiteral: GraphQLScalarLiteralParser<any>;
}

interface MarshalArgs {
  as: MarshalType;
}

const MarshalImpls: Record<MarshalType, MarshalImpl> = {
  INT_TYPE: {
    serialize: Number,
    parseValue: value => {
      if (typeof value === 'number' && Number.isInteger(value)) {
        return value;
      }
      throw new TypeError(`Expected an integer value; got '${String(value)}'`);
    },
    parseLiteral: node => {
      if (node.kind === Kind.INT) {
        return parseInt(node.value, 10);
      }
      throw new TypeError(`Expected an integer literal; got ${node.kind}`);
    },
  },
  FLOAT_TYPE: {
    serialize: Number,
    parseValue: value => {
      if (typeof value === 'number') {
        return value;
      }
      throw new TypeError(`Expected a number value; got '${String(value)}'`);
    },
    parseLiteral: node => {
      if (node.kind === Kind.INT || node.kind === Kind.FLOAT) {
        return parseFloat(node.value);
      }
      throw new TypeError(
        `Expected an integer or floating-point literal; got ${node.kind}`
      );
    },
  },
  STRING_TYPE: {
    serialize: String,
    parseValue: value => {
      if (typeof value === 'string') {
        return value;
      }
      throw new TypeError(`Expected a string value; got '${String(value)}'`);
    },
    parseLiteral: node => {
      if (node.kind === Kind.STRING) {
        return node.value;
      }
      throw new TypeError(`Expected a string literal; got ${node.kind}`);
    },
  },
};

const marshalDirectiveTransformer = (schema: GraphQLSchema): GraphQLSchema =>
  mapSchema(schema, {
    [MapperKind.SCALAR_TYPE]: scalarType => {
      const directive = getDirectives(schema, scalarType).find(d =>
        d.name === 'marshal'
      );
      if (directive) {
        const directiveArgs = directive.args as MarshalArgs;
        const impl = MarshalImpls[directiveArgs.as];
        if (!impl) {
          // This should never happen.
          throw new Error(`Unrecognised MarshalType: ${directiveArgs.as}`);
        }
        scalarType.serialize = impl.serialize;
        scalarType.parseValue = impl.parseValue;
        scalarType.parseLiteral = impl.parseLiteral;
        return scalarType;
      }
      return;
    },
  });

export default marshalDirectiveTransformer;
