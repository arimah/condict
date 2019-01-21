const mysql = require('mysql');

const MysqlAdaptor = require('./adaptor');
const generateSchema = require('./schema');

class DatabasePool {
  constructor(logger, options) {
    this.logger = logger;
    this.pool = mysql.createPool({
      connectionLimit: 100,
      ...options,
    });
  }

  getConnection(logger) {
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

  close() {
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

module.exports = {
  createPool: (logger, options) => new DatabasePool(logger, options),
  generateSchema,
};
