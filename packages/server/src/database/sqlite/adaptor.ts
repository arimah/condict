import {Database as Connection} from 'better-sqlite3';
import {Logger} from 'winston';
import {Pool} from 'generic-pool';

import Adaptor, {Sql, ExecResult} from '../adaptor';

// Please note: This function should probably be replaced by something more
// robust, as it will fail miserably with certain field names. We use it in
// this adaptor only because all the code is trusted; there are no foreign
// queries anywhere.
const escapeId = (id: string) => `"${id}"`;

class RawSql {
  public sql: string;
  public params: any[];

  public constructor(sql: string, params: any[]) {
    this.sql = sql;
    this.params = params;
  }
}

const formatValue = (params: any[]) => {
  const formatScalar = (value: any): string => {
    if (value instanceof RawSql) {
      params.push(...value.params);
      return value.sql;
    }
    if (typeof value === 'boolean') {
      return value ? '1' : '0';
    }
    if (typeof value === 'number') {
      return String(value);
    }
    params.push(value);
    return '?';
  };

  return (value: any) => {
    if (Array.isArray(value)) {
      return value.map(formatScalar).join(', ');
    }
    if (
      typeof value === 'object' &&
      !(value instanceof RawSql) &&
      value !== null
    ) {
      return Object.keys(value)
        .map(key => `${escapeId(key)} = ${formatScalar(value[key])}`)
        .join(', ');
    }
    return formatScalar(value);
  };
};

export default class SqliteAdaptor extends Adaptor {
  private readonly connection: Connection;
  private readonly pool: Pool<Connection>;

  public constructor(
    logger: Logger,
    connection: Connection,
    pool: Pool<Connection>
  ) {
    super(logger);

    this.connection = connection;
    this.pool = pool;
  }

  public get<Row>(parts: Sql, ...values: any[]): Row | null {
    const params: any[] = [];
    const sql = this.formatSql(parts, values, formatValue(params));
    this.logQuery(sql);
    return this.connection.prepare(sql).get(params) as Row || null;
  }

  public getRequired<Row>(parts: Sql, ...values: any[]): Row {
    const params: any[] = [];
    const sql = this.formatSql(parts, values, formatValue(params));
    this.logQuery(sql);
    const row = this.connection.prepare(sql).get(params) as Row || null;
    if (row === null) {
      throw new Error('No rows found');
    }
    return row;
  }

  public all<Row>(parts: Sql, ...values: any[]): Row[] {
    const params: any[] = [];
    const sql = this.formatSql(parts, values, formatValue(params));
    this.logQuery(sql);
    return this.connection.prepare(sql).all(params) as Row[];
  }

  public exec<I extends number = number>(parts: Sql, ...values: any[]): ExecResult<I> {
    const params: any[] = [];
    const sql = this.formatSql(parts, values, formatValue(params));
    this.logQuery(sql);
    const {
      changes: affectedRows,
      lastInsertRowid: insertId,
    } = this.connection.prepare(sql).run(params);
    return {insertId: insertId as I, affectedRows};
  }

  public beginTransaction(): void {
    this.connection.prepare('begin').run();
  }

  public commit() {
    this.connection.prepare('commit').run();
  }

  public rollBack() {
    this.connection.prepare('rollback').run();
  }

  public tableExists(name: string): boolean {
    type Row = { found: number };
    const {found} = this.get<Row>`
      select exists (
        select 1
        from sqlite_master
        where type = 'table'
          and name = ${name}
      ) as found
    ` as Row;
    return found === 1;
  }

  public raw(parts: Sql, ...values: any[]): RawSql {
    const params: any[] = [];
    const sql = this.formatSql(parts, values, formatValue(params));
    return new RawSql(sql, params);
  }

  public release() {
    this.pool.release(this.connection);
  }
}
