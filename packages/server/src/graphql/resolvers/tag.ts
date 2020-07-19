import {UserInputError} from 'apollo-server';

import {Tag} from '../../model';

import {TagId, Query as QueryType} from '../types';

import {ResolversFor, PageArg} from './types';

type TagArgs = {
  id?: TagId | null;
  name?: string | null;
};

const Query: ResolversFor<QueryType, unknown> = {
  tags: (_root, {page}: PageArg, {db}, info) => Tag.all(db, page, info),

  tag(_root, args: TagArgs, {db}) {
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
