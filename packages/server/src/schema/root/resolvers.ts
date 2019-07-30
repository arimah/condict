// The root schema contains various essential types and definitions.

import {Resolvers, ConnectionMeta as ConnectionMetaType} from '../types';

const ConnectionMeta: Resolvers<ConnectionMetaType> = {
  hasNext: p => (p.page + 1) * p.perPage < p.totalCount,

  hasPrev: p => p.page > 0,
};

export default {
  ConnectionMeta,
};
