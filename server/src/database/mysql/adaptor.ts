import {escape, PoolConnection} from 'mysql';
import {Logger} from 'winston';

import Adaptor, {Sql, ExecResult} from '../adaptor';

class RawSql {
  private readonly sql: string;

  public constructor(sql: string) {
    this.sql = sql;
  }

  // mysql library enables us to do this \o/
  public toSqlString(): string {
    return this.sql;
  }
}

export default class MysqlAdaptor extends Adaptor {
  private readonly connection: PoolConnection;

  public constructor(logger: Logger, connection: PoolConnection) {
    super(logger);

    this.connection = connection;
  }

  public get<Row>(parts: Sql, ...values: any[]): Promise<Row | null> {
    const sql = this.formatSql(parts, values, v => escape(v));
    return this.query<Row[], Row | null>(
      sql,
      results => results[0] || null
    );
  }

  public all<Row>(parts: Sql, ...values: any[]): Promise<Row[]> {
    const sql = this.formatSql(parts, values, v => escape(v));
    return this.query<Row[]>(sql, results => results);
  }

  public exec(parts: Sql, ...values: any[]): Promise<ExecResult> {
    const sql = this.formatSql(parts, values, v => escape(v));
    return this.query<ExecResult>(
      sql,
      ({insertId, affectedRows}) => ({insertId, affectedRows})
    );
  }

  public query<Q, R = Q>(
    sql: string,
    mapResults: (results: Q) => R
  ): Promise<R> {
    this.logQuery(sql);
    return new Promise((resolve, reject) => {
      this.connection.query(sql, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(mapResults(results as Q));
        }
      });
    });
  }

  public beginTransaction(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.beginTransaction(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public commit(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.commit(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public rollBack(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.commit(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public async tableExists(name: string): Promise<boolean> {
    interface Row { found: number }
    const {found} = await this.get<Row>`
      select exists (
        select 1
        from information_schema.\`TABLES\` t
        where t.TABLE_NAME = ${name}
          and t.TABLE_SCHEMA = database()
      ) as found
    ` as Row;
    return found === 1;
  }

  public raw(parts: Sql, ...values: any[]): RawSql {
    const sql = this.formatSql(parts, values, v => escape(v));
    return new RawSql(sql);
  }

  public release() {
    this.connection.release();
  }
}
