const Adaptor = require('../adaptor');

// Please note: This function should probably be replaced by something more
// robust, as it will fail miserably with certain field names. We use it in
// this adaptor only because all the code is trusted; there are no foreign
// queries anywhere.
const escapeId = id => `"${id}"`;

const formatValue = params => {
  const formatScalar = value => {
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

  return value => {
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

class RawSql {
  constructor(sql, params) {
    this.sql = sql;
    this.params = params;
  }
}

class SqliteAdaptor extends Adaptor {
  constructor(logger, connection, pool) {
    super(logger);

    this.connection = connection;
    this.pool = pool;
  }

  get(parts, ...values) {
    const params = [];
    const sql = this.formatSql(parts, values, formatValue(params));
    this.logQuery(sql);
    return this.connection.prepare(sql).get(params) || null;
  }

  all(parts, ...values) {
    const params = [];
    const sql = this.formatSql(parts, values, formatValue(params));
    this.logQuery(sql);
    return this.connection.prepare(sql).all(params);
  }

  exec(parts, ...values) {
    const params = [];
    const sql = this.formatSql(parts, values, formatValue(params));
    this.logQuery(sql);
    const {
      changes: affectedRows,
      lastInsertRowid: insertId
    } = this.connection.prepare(sql).run(params);
    return {insertId, affectedRows};
  }

  beginTransaction() {
    this.connection.prepare('begin').run();
  }

  commit() {
    this.connection.prepare('commit').run();
  }

  rollBack() {
    this.connection.prepare('rollback').run();
  }

  tableExists(name) {
    const {found} = this.get`
      select exists (
        select 1
        from sqlite_master
        where type = 'table'
          and name = ${name}
      ) as found
    `;
    return found === 1;
  }

  raw(parts, ...values) {
    const params = [];
    const sql = this.formatSql(parts, values, formatValue(params));
    return new RawSql(sql, params);
  }

  release() {
    this.pool.release(this.connection);
  }
}

module.exports = SqliteAdaptor;
