const fs = require('fs');
const path = require('path');

const {gql} = require('apollo-server');
const merge = require('deepmerge');

const allTypeDefs = [
  gql`
    # Make sure the Query and Mutation types are available for extension.
    type Query

    type Mutation

    # General-purpose metadata type for paginated content.
    type ConnectionMeta {
      "The 0-based page number. This value is always greater than or equal to 0."
      page: Int!

      "The total number of items per page. This value is always at least 1."
      perPage: Int!

      """
      The total number of items in the paginated collection. This value is always
      greater than or equal to 0.
      """
      totalCount: Int!

      "Determines whether there are more items in the collection."
      hasNext: Boolean!

      """
      Determines whether there are items on earlier pages. This value is true if
      and only if \`page\` is greater than zero.
      """
      hasPrev: Boolean!
    }

    # Input type for pagination parameters.
    input PageParams {
      "The 0-based page number. This value cannot be less than 0."
      page: Int!

      "The total number of items per page. This value cannot be less than 1. Each field defines its own upper limit."
      perPage: Int!
    }
  `,
];

const initialResolvers = {
  ConnectionMeta: {
    hasNext: p => (p.page + 1) * p.perPage < p.totalCount,

    hasPrev: p => p.page > 0,
  },
};

const allResolvers =
  fs.readdirSync(__dirname)
    .filter(file => fs.statSync(path.join(__dirname, file)).isDirectory())
    .reduce((allResolvers, dir) => {
      // GraphQL schema definition is in schema.graphql
      const typeDefs = fs.readFileSync(
        path.join(__dirname, dir, 'schema.graphql'),
        {encoding: 'utf-8'}
      );
      allTypeDefs.push(typeDefs);

      // Resolvers are in resolvers.js
      const resolvers = require(`./${dir}/resolvers`);
      return merge(allResolvers, resolvers);
    }, initialResolvers);

module.exports = {
  typeDefs: allTypeDefs,
  resolvers: allResolvers,
};
