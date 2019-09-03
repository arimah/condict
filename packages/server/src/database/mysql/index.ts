import * as mysql from 'mysql';

import {Logger} from '../../types';

import {Driver} from '../types';

import MysqlAdaptor from './adaptor';
import generateSchema from './schema';
import {Options, validateOptions} from './types';

class DatabasePool {
  private readonly logger: Logger;
  private readonly pool: mysql.Pool;

  public constructor(logger: Logger, options: Options) {
    this.logger = logger;
    this.pool = mysql.createPool({
      connectionLimit: 100,
      charset: 'utf8mb4',
      ...options,
    });
  }

  public getConnection(): Promise<MysqlAdaptor> {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          resolve(new MysqlAdaptor(this.logger, connection));
        }
      });
    });
  }

  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pool.end(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

const engine: Driver<Options> = {
  createPool: (logger: Logger, options: Options) =>
    new DatabasePool(logger, options),
  generateSchema,
  validateOptions,
};

export default engine;
