import {
  InlineKind,
  BlockElementJson,
  InlineElementJson,
} from '../../rich-text/types';

import {Resolvers} from '../types';

const BlockElement: Resolvers<BlockElementJson> = {
  // Level 0 is not usually stored in the object, to save space.
  level: p => p.level || 0,
};

const InlineElement: Resolvers<InlineElementJson> = {
  __resolveType(p) {
    switch (p.kind) {
      case InlineKind.BOLD:
      case InlineKind.ITALIC:
      case InlineKind.UNDERLINE:
      case InlineKind.STRIKETHROUGH:
      case InlineKind.SUPERSCRIPT:
      case InlineKind.SUBSCRIPT:
        return 'StyleInline';
      case InlineKind.LINK:
        return 'LinkInline';
      default:
        throw new Error(`Invalid inline element kind: ${p.kind}`);
    }
  }
};

export default {
  BlockElement,
  InlineElement,
};
