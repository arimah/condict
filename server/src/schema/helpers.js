module.exports = {
  // TODO: Actually authenticate literally anything
  withAuthentication: resolver =>
    (p, args, context, info) =>
      resolver(p, args, context, info),

  createConnection: (pageParams, totalCount, values) => ({
    meta: {
      page: pageParams.page,
      perPage: pageParams.perPage,
      totalCount,
    },
    values,
  }),
};
