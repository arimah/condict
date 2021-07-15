import {ValueNode, Kind} from 'graphql';
import {
  ExecutableSchemaTransformation,
  MapperKind,
  mapSchema,
  getDirectives,
} from 'graphql-tools';

const serialize = (value: any) => value as unknown;

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
      throw new TypeError(`Value ${node.value} could not be parsed as an integer`);
    }
    return n;
  }
  return new TypeError(
    `ID type expected an integer or string literal; got ${node.kind}`
  );
};

const idDirectiveTransformer: ExecutableSchemaTransformation = schema =>
  mapSchema(schema, {
    [MapperKind.SCALAR_TYPE]: scalarType => {
      const directives = getDirectives(schema, scalarType);
      if (directives['id']) {
        scalarType.serialize = serialize;
        scalarType.parseValue = parseValue;
        scalarType.parseLiteral = parseLiteral;
        return scalarType;
      }
      return;
    },
  });

export default idDirectiveTransformer;
