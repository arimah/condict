import {UserInputError} from 'apollo-server';

import {Resolvers, PageArg} from '../types';

interface TagArgs {
  id?: string | null;
  name?: string | null;
}

const Query: Resolvers<unknown> = {
  tags: (_root, {page}: PageArg, {model: {Tag}}) => Tag.all(page),

  tag(_root, args: TagArgs, {model: {Tag}}) {
    if (args.id != null) {
      return Tag.byId(+args.id);
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
