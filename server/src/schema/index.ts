import fs from 'fs';
import path from 'path';

import {gql, IResolvers} from 'apollo-server';
import merge from 'deepmerge';

import DefinitionResolvers from './definition/resolvers';
import ElementResolvers from './element/resolvers';
import InflectionTableResolvers from './inflection-table/resolvers';
import LanguageResolvers from './language/resolvers';
import LemmaResolvers from './lemma/resolvers';
import PartOfSpeechResolvers from './part-of-speech/resolvers';
import RootResolvers from './root/resolvers';

// I have no idea if it's even slightly possible to get TypeScript to generate
// a meaningful type for allResolvers. We will just forcefully cast it.
const allResolvers = merge.all([
  DefinitionResolvers,
  ElementResolvers,
  InflectionTableResolvers,
  LanguageResolvers,
  LemmaResolvers,
  PartOfSpeechResolvers,
  RootResolvers,
]) as IResolvers<any, any>;

// GraphQL schema type definitions are read from the schema.graphql file
// within each folder.
const allTypeDefs =
  fs.readdirSync(__dirname)
    .filter(file => fs.statSync(path.join(__dirname, file)).isDirectory())
    .map(dir =>
      fs.readFileSync(
        path.join(__dirname, dir, 'schema.graphql'),
        {encoding: 'utf-8'}
      )
    )
    .map(schema => gql(schema));

export default {
  typeDefs: allTypeDefs,
  resolvers: allResolvers,
};
