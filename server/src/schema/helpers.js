const {UserInputError} = require('apollo-server');

module.exports = {
  // TODO: Actually authenticate literally anything
  withAuthentication: resolver =>
    (p, args, context, info) =>
      resolver(p, args, context, info),

  validatePageParams(page, maxPerPage) {
    if (page.page < 0) {
      throw new UserInputError(`Page number must be greater than zero; got ${page.page}`, {
        invalidArgs: ['page']
      });
    }

    if (page.perPage < 1 || page.perPage > maxPerPage) {
      throw new UserInputError(`perPage must be between 1 and ${maxPerPage}; got ${page.perPage}`, {
        invalidArgs: ['page']
      });
    }

    return page;
  },

  createConnection: (pageParams, totalCount, nodes) => ({
    meta: {
      page: pageParams.page,
      perPage: pageParams.perPage,
      totalCount,
    },
    nodes,
  }),
};
