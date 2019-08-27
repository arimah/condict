// The root schema contains various essential types and definitions.

import {PageInfo as PageInfoType} from '../types';

import {Resolvers} from './types';

const PageInfo: Resolvers<PageInfoType> = {
  hasNext: p => (p.page + 1) * p.perPage < p.totalCount,

  hasPrev: p => p.page > 0,
};

export default {
  PageInfo,
};
