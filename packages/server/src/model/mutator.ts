import Adaptor from '../database/adaptor';

import {ModelResolver, MutatorResolver} from './';

export default class Mutator {
  protected readonly db: Adaptor;
  protected readonly model: ModelResolver;
  protected readonly mut: MutatorResolver;

  public constructor(db: Adaptor, model: ModelResolver, mut: MutatorResolver) {
    this.db = db;
    this.model = model;
    this.mut = mut;
  }
}
