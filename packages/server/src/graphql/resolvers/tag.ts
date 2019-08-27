import {UserInputError} from 'apollo-server';

import {TagId, Query as QueryType} from '../types';

import {ResolversFor, PageArg} from './types';

type TagArgs = {
  id?: TagId | null;
  name?: string | null;
};

const Query: ResolversFor<QueryType, unknown> = {
  tags: (_root, {page}: PageArg, {model: {Tag}}) => Tag.all(page),

  tag(_root, args: TagArgs, {model: {Tag}}) {
    if (args.id != null) {
      return Tag.byId(args.id);
    }
    if (args.name != null) {
      return Tag.byName(args.name);
    }
    throw new UserInputError(`You must specify one of 'id' or 'name'`, {
      invalidArgs: ['id', 'name'],
    });
  },
};

export default {
  Query,
};
