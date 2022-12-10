import {Tag} from '../../model';
import {UserInputError} from '../../errors';

import {Query as QueryType} from '../types';

import {ResolversFor} from './types';

const Query: ResolversFor<QueryType, null> = {
  tags: (_root, {page}, {db}, info) => Tag.all(db, page, info),

  tag(_root, args, {db}) {
    if (args.id != null) {
      return Tag.byId(db, args.id);
    }
    if (args.name != null) {
      return Tag.byName(db, args.name);
    }
    throw new UserInputError(`You must specify one of 'id' or 'name'`, {
      invalidArgs: ['id', 'name'],
    });
  },
};

export default {
  Query,
};
