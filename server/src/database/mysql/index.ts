import * as mysql from 'mysql';
import {Logger} from 'winston';

import {Driver} from '../types';

import MysqlAdaptor from './adaptor';
import generateSchema from './schema';

export type MysqlOptions = Pick<
  mysql.ConnectionConfig,
  'user' | 'password' | 'database' | 'host' | 'port'
>;

class DatabasePool {
  private readonly logger: Logger;
  private readonly pool: mysql.Pool;

  public constructor(logger: Logger, options: MysqlOptions) {
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

const engine: Driver = {
  createPool: (logger: Logger, options: any) =>
    new DatabasePool(logger, options as MysqlOptions),
  generateSchema,
};

export default engine;
