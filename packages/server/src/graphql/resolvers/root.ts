// The root schema contains various essential types and definitions.

import {ConnectionMeta as ConnectionMetaType} from '../types';

import {Resolvers} from './types';

const ConnectionMeta: Resolvers<ConnectionMetaType> = {
  hasNext: p => (p.page + 1) * p.perPage < p.totalCount,

  hasPrev: p => p.page > 0,
};

export default {
  ConnectionMeta,
};
