import {
  GraphQLScalarType,
  GraphQLScalarSerializer,
  GraphQLScalarValueParser,
  GraphQLScalarLiteralParser,
  Kind,
} from 'graphql';
import {SchemaDirectiveVisitor} from 'graphql-tools';

import {MarshalType} from './types';

type MarshalImpl = {
  serialize: GraphQLScalarSerializer<any>;
  parseValue: GraphQLScalarValueParser<any>;
  parseLiteral: GraphQLScalarLiteralParser<any>;
};

type MarshalArgs = {
  as: MarshalType;
};

const MarshalImpls: Record<MarshalType, MarshalImpl> = {
  INT_TYPE: {
    serialize: Number,
    parseValue: value => {
      if (typeof value === 'number' && Number.isInteger(value)) {
        return value;
      }
      throw new TypeError(`Expected an integer value; got '${value}'`);
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
      throw new TypeError(`Expected a number value; got '${value}'`);
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
      throw new TypeError(`Expected a string value; got '${value}'`);
    },
    parseLiteral: node => {
      if (node.kind === Kind.STRING) {
        return node.value;
      }
      throw new TypeError(`Expected a string literal; got ${node.kind}`);
    },
  },
};

export default class MarshalDirective extends SchemaDirectiveVisitor<MarshalArgs> {
  public visitScalar(scalar: GraphQLScalarType): GraphQLScalarType | void | null {
    const type = this.args.as;
    const impl = MarshalImpls[type];
    if (!impl) {
      // This should never happen.
      throw new Error(`Unexpected error: unrecognised MarshalType: ${type}`);
    }
    scalar.serialize = impl.serialize;
    scalar.parseValue = impl.parseValue;
    scalar.parseLiteral = impl.parseLiteral;
    return scalar;
  }
}
