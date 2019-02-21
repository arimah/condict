const fs = require('fs');
const path = require('path');

const merge = require('deepmerge');

const allTypeDefs = [];

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
    }, {});

module.exports = {
  typeDefs: allTypeDefs,
  resolvers: allResolvers,
};
