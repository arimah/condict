import {ExecutableSchemaTransformation} from 'graphql-tools';

import idDirectiveTransformer from './id';
import marshalDirectiveTransformer from './marshal';

export const getDirectives = (): ExecutableSchemaTransformation[] => [
  idDirectiveTransformer,
  marshalDirectiveTransformer,
];
