const mysql = require('mysql');

const Adaptor = require('../adaptor');

class RawSql {
  constructor(sql) {
    this.sql = sql;
  }

  // mysql library enables us to do this \o/
  toSqlString() {
    return this.sql;
  }
}

class MysqlAdaptor extends Adaptor {
  constructor(logger, connection) {
    super(logger);

    this.connection = connection;
  }

  get(parts, ...values) {
    const sql = this.formatSql(parts, values, mysql.escape);
    return this.query(sql, results => results[0] || null);
  }

  all(parts, ...values) {
    const sql = this.formatSql(parts, values, mysql.escape);
    return this.query(sql, results => results);
  }

  exec(parts, ...values) {
    const sql = this.formatSql(parts, values, mysql.escape);
    return this.query(
      sql,
      ({insertId, affectedRows}) => ({insertId, affectedRows})
    );
  }

  query(sql, mapResults) {
    this.logQuery(sql);
    return new Promise((resolve, reject) => {
      this.connection.query(sql, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(mapResults(results));
        }
      });
    });
  }

  beginTransaction() {
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

  commit() {
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

  rollBack() {
    return new Promise((resolve, reject) => {
      this.connection.rollback(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async tableExists(name) {
    const {found} = await this.get`
      select exists (
        select 1
        from information_schema.\`TABLES\` t
        where t.TABLE_NAME = ${name}
          and t.TABLE_SCHEMA = database()
      ) as found
    `;
    return found === 1;
  }

  raw(parts, ...values) {
    const sql = this.formatSql(parts, values, mysql.escape);
    return new RawSql(sql);
  }

  release() {
    this.connection.release();
  }
}

module.exports = MysqlAdaptor;
