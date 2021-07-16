import {RecentChanges, RecentItemRow} from '../../model';

import {RecentItem as RecentItemType, Query as QueryType} from '../types';

import {ResolversFor} from './types';

const RecentItem: ResolversFor<RecentItemType, RecentItemRow> = {
  __resolveType: p => {
    switch (p.type) {
      case 'language':
        return 'Language';
      case 'definition':
        return 'Definition';
      case 'part-of-speech':
        return 'PartOfSpeech';
      case 'inflection-table':
        return 'InflectionTable';
    }
  },
};

const Query: ResolversFor<QueryType, null> = {
  recentChanges: (_root, args, {db}, info) =>
    RecentChanges.get(db, args.page, args.order, info),
};

export default {
  RecentItem,
  Query,
};
