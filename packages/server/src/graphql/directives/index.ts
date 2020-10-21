import {SchemaDirectiveVisitorClass} from 'graphql-tools';

import IdDirective from './id';
import MarshalDirective from './marshal';

type Directives = Record<string, SchemaDirectiveVisitorClass>;

export const getDirectives = (): Directives => ({
  id: IdDirective,
  marshal: MarshalDirective as SchemaDirectiveVisitorClass,
});
