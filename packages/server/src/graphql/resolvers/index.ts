import {IResolvers} from '@graphql-tools/utils';

import DefinitionResolvers from './definition';
import ElementResolvers from './element';
import FieldResolvers from './field';
import InflectionTableResolvers from './inflection-table';
import LanguageResolvers from './language';
import LemmaResolvers from './lemma';
import PartOfSpeechResolvers from './part-of-speech';
import RecentsResolvers from './recents';
import RootResolvers from './root';
import SearchResolvers from './search';
import TagResolvers from './tag';
import UserResolvers from './user';

export * from './types';

/**
 * Gets an object that contains all resolvers.
 */
export const getResolvers = (): IResolvers<any, any> => {
  const result: IResolvers<any, any> = {};

  const allTypeResolvers = [
    DefinitionResolvers,
    ElementResolvers,
    FieldResolvers,
    InflectionTableResolvers,
    LanguageResolvers,
    LemmaResolvers,
    PartOfSpeechResolvers,
    RecentsResolvers,
    RootResolvers,
    SearchResolvers,
    TagResolvers,
    UserResolvers,
  ];

  for (const typeResolvers of allTypeResolvers) {
    for (const [typeName, fieldResolvers] of Object.entries(typeResolvers)) {
      result[typeName] = Object.assign(result[typeName] ?? {}, fieldResolvers);
    }
  }

  return result;
};
