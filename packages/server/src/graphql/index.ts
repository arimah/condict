import fs from 'fs';
import path from 'path';

import {DocumentNode} from 'graphql';
import {gql, IResolvers} from 'apollo-server';
import merge from 'deepmerge';

import DefinitionResolvers from './resolvers/definition';
import ElementResolvers from './resolvers/element';
import InflectionTableResolvers from './resolvers/inflection-table';
import LanguageResolvers from './resolvers/language';
import LemmaResolvers from './resolvers/lemma';
import PartOfSpeechResolvers from './resolvers/part-of-speech';
import RootResolvers from './resolvers/root';
import TagResolvers from './resolvers/tag';
import UserResolvers from './resolvers/user';

import IdDirective from './id-directive';
import MarshalDirective from './marshal-directive';

export {Context} from './resolvers/types';

export type Directives = {
  readonly id: typeof IdDirective,
  readonly marshal: typeof MarshalDirective,
};

export const getResolvers = (): IResolvers<any, any> =>
  // I have no idea if it's even slightly possible to get TypeScript to generate
  // a meaningful type for allResolvers. We will just forcefully cast it.
  merge.all([
    DefinitionResolvers,
    ElementResolvers,
    InflectionTableResolvers,
    LanguageResolvers,
    LemmaResolvers,
    PartOfSpeechResolvers,
    RootResolvers,
    TagResolvers,
    UserResolvers,
  ]) as IResolvers<any, any>;

// GraphQL schema type definitions are read from the .graphql files
// within the schema folder.
export const getTypeDefs = (): DocumentNode[] =>
  fs.readdirSync(path.join(__dirname, 'schema'))
    .filter(file => file.endsWith('.graphql'))
    .map(file =>
      fs.readFileSync(
        path.join(__dirname, 'schema', file),
        {encoding: 'utf-8'}
      )
    )
    .map(schema => gql(schema));

export const getDirectives = (): Directives => ({
  id: IdDirective,
  marshal: MarshalDirective,
});
