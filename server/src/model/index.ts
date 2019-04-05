import {Logger} from 'winston';

import Adaptor from '../database/adaptor';

import DefinitionModel from './definition/model';
import InflectionTableModel from './inflection-table/model';
import LanguageModel from './language/model';
import LemmaModel from './lemma/model';
import PartOfSpeechModel from './part-of-speech/model';
import TagModel from './tag/model';

import DefinitionMut from './definition/mut';
import InflectionTableMut from './inflection-table/mut';
import LanguageMut from './language/mut';
import LemmaMut from './lemma/mut';
import PartOfSpeechMut from './part-of-speech/mut';
import TagMut from './tag/mut';

// This transforms a property like `x: typeof Foo` into `x: Foo`, that is,
// `x` becomes an *instance* of Foo rather than the *constructor* of Foo.
//
// It's not clear to me that this is specifically designed to work in TS,
// but it does, so I'll take it!
type PrototypesOf<T> = {
  [P in keyof T]: T[P] extends Function ? T[P]['prototype'] : never;
};

export type ModelResolver = PrototypesOf<
  typeof DefinitionModel &
  typeof InflectionTableModel &
  typeof LanguageModel &
  typeof LemmaModel &
  typeof PartOfSpeechModel &
  typeof TagModel
>;

export type MutatorResolver = PrototypesOf<
  typeof DefinitionMut &
  typeof InflectionTableMut &
  typeof LanguageMut &
  typeof LemmaMut &
  typeof PartOfSpeechMut &
  typeof TagMut
>;

export interface Resolvers {
  model: ModelResolver;
  mut: MutatorResolver;
}

const AllModels = {
  ...DefinitionModel,
  ...InflectionTableModel,
  ...LanguageModel,
  ...LemmaModel,
  ...PartOfSpeechModel,
  ...TagModel,
};

const AllMutators = {
  ...DefinitionMut,
  ...InflectionTableMut,
  ...LanguageMut,
  ...LemmaMut,
  ...PartOfSpeechMut,
  ...TagMut,
};

// These prototypes are intended to be used with Object.create to construct
// a value of the corresponding resolver type. When a getter is invoked, it
// constructs the model, then caches a copy of it in the resolver. Having a
// prototype for these means we don't have to copy every model and mutator
// to a new object on every request; just assign a prototype and that's it.
// I'm not sure if it's possible to do this without escaping to 'any'-land.

const ModelResolverPrototype: ModelResolver = (() => {
  const result: any = {};

  for (const [name, ModelType] of Object.entries(AllModels)) {
    Object.defineProperty(result, name, {
      get() {
        (this.logger as Logger).debug(`Instantiating model: ${name}`);

        const value = new ModelType(
          this.db as Adaptor,
          this as ModelResolver
        );
        Object.defineProperty(this, name, {value});
        return value;
      },
    });
  }

  return result;
})();

const MutatorResolverPrototype: MutatorResolver = (() => {
  const result: any = {};

  for (const [name, MutatorType] of Object.entries(AllMutators)) {
    Object.defineProperty(result, name, {
      get() {
        (this.logger as Logger).debug(`Instantiating mutator: ${name}`);

        const value = new MutatorType(
          this.db as Adaptor,
          this.model as ModelResolver,
          this as MutatorResolver
        );
        Object.defineProperty(this, name, {value});
        return value;
      },
    });
  }

  return result;
})();

export default (db: Adaptor, logger: Logger): Resolvers => {
  const model: ModelResolver = Object.assign(
    Object.create(ModelResolverPrototype),
    {db, logger}
  );
  const mut: MutatorResolver = Object.assign(
    Object.create(MutatorResolverPrototype),
    {db, logger, model}
  );
  return {model, mut};
};
