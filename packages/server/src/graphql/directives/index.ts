import {GraphQLSchema} from 'graphql';

import idDirectiveTransformer from './id';
import marshalDirectiveTransformer from './marshal';

type SchemaTransformer = (schema: GraphQLSchema) => GraphQLSchema;

export const getDirectives = (): SchemaTransformer[] => [
  idDirectiveTransformer,
  marshalDirectiveTransformer,
];
