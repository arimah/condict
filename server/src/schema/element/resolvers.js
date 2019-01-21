module.exports = {
  BlockElement: {
    // Level 0 is not usually stored in the object, to save space.
    level: p => p.level || 0,
  },

  InlineElement: {
    __resolveType(p) {
      switch (p.kind) {
        case 'BOLD':
        case 'ITALIC':
        case 'UNDERLINE':
        case 'STRIKETHROUGH':
        case 'SUPERSCRIPT':
        case 'SUBSCRIPT':
          return 'StyleInline';
        case 'LINK':
          return 'LinkInline';
        default:
          throw new Error(`Invalid inline element kind: ${p.kind}`);
      }
    }
  },
};
