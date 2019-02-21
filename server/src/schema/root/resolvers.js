// The root schema contains various essential types and definitions.

module.exports = {
  ConnectionMeta: {
    hasNext: p => (p.page + 1) * p.perPage < p.totalCount,

    hasPrev: p => p.page > 0,
  },
};
