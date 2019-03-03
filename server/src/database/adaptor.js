const DataLoader = require('dataloader');

const FieldSet = require('../model/field-set');

const reindentQuery = require('./reindent-query');

const getRowIdDefault = row => row.id;

const notImplemented = methodName => {
  throw new Error(`Method not implemented: ${methodName}`);
};

class Adaptor {
  constructor(logger) {
    this.logger = logger;
    this.dataLoaders = {};

    this.logQueries = process.env.DEBUG_QUERIES === '1';
  }

  get() {
    notImplemented('get');
  }

  all() {
    notImplemented('all');
  }

  exec() {
    notImplemented('exec');
  }

  beginTransaction() {
    notImplemented('beginTransaction');
  }

  commit() {
    notImplemented('commit');
  }

  rollBack() {
    notImplemented('rollBack');
  }

  release() {
    notImplemented('release');
  }

  tableExists(_name) {
    notImplemented('tableExists');
  }

  raw() {
    notImplemented('raw');
  }

  formatSql(parts, values, handleValue) {
    // Single query with nothing else.
    if (typeof parts === 'string') {
      return parts;
    }

    // Skip a tiny amount of extra work occasionally.
    if (parts.length === 1) {
      return parts[0];
    }

    let sql = '';
    for (let i = 0; i < parts.length; i++) {
      sql += parts[i];
      if (i < values.length) {
        const value = values[i];
        if (value instanceof FieldSet) {
          sql += handleValue(value.toPlainObject());
        } else {
          sql += handleValue(value);
        }
      }
    }
    return sql;
  }

  async transact(callback) {
    await this.beginTransaction();
    let result;
    try {
      result = await callback();
      await this.commit();
    } catch (e) {
      await this.rollBack();
      throw e;
    }
    return result;
  }

  logQuery(sql) {
    if (!this.logQueries) {
      return;
    }

    if (/^\s*$/.test(sql)) {
      this.logger.warn('Empty query?!');
    } else {
      const reindentedSql = reindentQuery(sql);
      this.logger.debug(`Query:\n${reindentedSql}`);
    }
  }

  batchOneToOne(
    batchKey,
    id,
    fetcher,
    getRowId = getRowIdDefault,
    extraArg = undefined
  ) {
    if (!this.dataLoaders[batchKey]) {
      this.dataLoaders[batchKey] = new DataLoader(async ids => {
        const rows = await fetcher(this, ids, extraArg);
        const rowsById = rows.reduce((acc, row) => {
          acc[getRowId(row)] = row;
          return acc;
        }, {});
        return ids.map(id => rowsById[id] || null);
      });
    }
    return this.dataLoaders[batchKey].load(id);
  }

  batchOneToMany(
    batchKey,
    id,
    fetcher,
    getRowId,
    extraArg = undefined
  ) {
    if (!this.dataLoaders[batchKey]) {
      this.dataLoaders[batchKey] = new DataLoader(async ids => {
        const rows = await fetcher(this, ids, extraArg);
        // If there is only a single ID, assume all rows belong to it.
        if (ids.length === 1) {
          return [rows];
        }
        // Otherwise, find out which ID each row belongs to.
        const rowsById = rows.reduce((acc, row) => {
          const rowId = getRowId(row);
          if (!acc[rowId]) {
            acc[rowId] = [row];
          } else {
            acc[rowId].push(row);
          }
          return acc;
        }, {});
        return ids.map(id => rowsById[id] || []);
      });
    }
    return this.dataLoaders[batchKey].load(id);
  }

  clearCache(batchKey, id) {
    if (this.dataLoaders[batchKey]) {
      this.dataLoaders[batchKey].clear(id);
    }
  }
}

module.exports = Adaptor;
