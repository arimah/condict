import {Connection} from '../database';

import {ModelResolver} from './';

export default class Model {
  protected readonly db: Connection;
  protected readonly model: ModelResolver;

  public constructor(db: Connection, model: ModelResolver) {
    this.db = db;
    this.model = model;
  }
}
