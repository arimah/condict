import {Connection} from '../database';

import {ModelResolver, MutatorResolver} from './';

export default class Mutator {
  protected readonly db: Connection;
  protected readonly model: ModelResolver;
  protected readonly mut: MutatorResolver;

  public constructor(
    db: Connection,
    model: ModelResolver,
    mut: MutatorResolver
  ) {
    this.db = db;
    this.model = model;
    this.mut = mut;
  }
}
