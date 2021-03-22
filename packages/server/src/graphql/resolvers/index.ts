import {IResolvers} from 'apollo-server';
import merge from 'deepmerge';

import DefinitionResolvers from './definition';
import ElementResolvers from './element';
import InflectionTableResolvers from './inflection-table';
import LanguageResolvers from './language';
import LemmaResolvers from './lemma';
import PartOfSpeechResolvers from './part-of-speech';
import RootResolvers from './root';
import TagResolvers from './tag';
import UserResolvers from './user';

export * from './types';

/**
 * Gets an object that contains all resolvers.
 */
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