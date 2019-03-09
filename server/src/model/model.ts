import Adaptor from '../database/adaptor';

import {ModelResolver} from './';

export default class Model {
  protected readonly db: Adaptor;
  protected readonly model: ModelResolver;

  public constructor(db: Adaptor, model: ModelResolver) {
    this.db = db;
    this.model = model;
  }
}
