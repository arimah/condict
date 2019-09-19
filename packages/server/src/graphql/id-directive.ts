import {GraphQLScalarType, ValueNode, Kind} from 'graphql';
import {SchemaDirectiveVisitor} from 'graphql-tools';

const serialize = (value: any) => value;

const parseValue = (value: any) => {
  if (typeof value === 'number') {
    return value | 0;
  }
  if (typeof value === 'string') {
    const n = parseInt(value, 10);
    // | 0 to get rid of NaN and infinity
    return n | 0;
  }
  return 0;
};

const parseLiteral = (node: ValueNode) => {
  if (node.kind === Kind.INT) {
    return parseInt(node.value, 10);
  }
  if (node.kind === Kind.STRING) {
    const n = parseInt(node.value, 10);
    if (isNaN(n) || !isFinite(n)) {
      return null;
    }
    return n;
  }
  return null;
};

export default class IdDirective extends SchemaDirectiveVisitor {
  public visitScalar(scalar: GraphQLScalarType): GraphQLScalarType | void | null {
    scalar.serialize = serialize;
    scalar.parseValue = parseValue;
    scalar.parseLiteral = parseLiteral;
    return scalar;
  }
}
