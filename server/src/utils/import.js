const schema = require('../database/schema');
const getNewIdMap = require('./get-new-id-map');
const fileFacts = require('./dump-file-facts');
const LineReader = require('./line-reader');

// The entire importer is built around a few central assumptions:
//
// 1. If a table has a column named `id`, it is the primary key in that table,
//    and no other column is part of the PK.
// 2. Any column named `id` is also auto-incremented.

const verifyHeader = async (logger, lines) => {
  const header = await lines.read(true);
  if (header !== fileFacts.header) {
    throw new Error(`Invalid header; expected '${fileFacts.header}', got ${header}`);
  }

  const metaLine = await lines.read(true);
  const meta = JSON.parse(metaLine);

  if (meta.schemaVersion !== schema.version) {
    throw new Error(
      `The export was made with an incompatible version of Condict (required schema version: ${schema.version}; got: ${meta.schemaVersion})`
    );
  }

  const separator = await lines.read(true);
  if (separator !== fileFacts.separator) {
    throw new Error(`Expected separator ('${fileFacts.separator}'), got '${separator}`);
  }

  logger.debug(`Importing database export from ${meta.exportDate}`);
};

const getColumnImporters = table =>
  table.columns
    .filter(c =>
      c.references && c.references.column === 'id' ||
      c.import
    )
    .map(c => {
      // If a column has both an importer and a reference, always prefer
      // the custom importer. It will have to deal with updating foreign
      // key references.
      if (c.import) {
        return (row, newIds) => {
          row[c.name] = c.import(row[c.name], newIds);
        };
      } else {
        return (row, newIds) => {
          const newId = newIds[c.references.table].get(row[c.name]);
          row[c.name] = newId;
        };
      }
    });

module.exports = async (logger, db, inputStream) => {
  const startTime = Date.now();
  logger.info('Starting database import.');

  const newIds = getNewIdMap(schema);
  const lines = new LineReader(inputStream);

  await verifyHeader(logger, lines);

  await db.transact(async () => {
    table: for (const table of schema) {
      if (table.skipExport) {
        continue;
      }

      logger.debug(`Importing table: ${table.name}`);

      const tableName = await lines.read(true);
      if (tableName !== table.name) {
        throw new Error(`Expected table name ${table.name}, got: ${tableName}`);
      }

      const newTableIds = newIds[table.name];

      const tableNameSql = db.raw(table.name);

      const columnNames = table.columns
        .filter(c => c.name !== 'id')
        .map(c => c.name);
      const columnNamesSql = db.raw(columnNames.join(', '));
      const columnImporters = getColumnImporters(table);

      let index = 0;
      for (;;) {
        const line = await lines.read(true);
        if (line === null) {
          break;
        }
        if (line === fileFacts.separator) {
          // Last line was the last row in the table; continue with the next table.
          continue table;
        }

        // This should be a row from the table. Try to parse it as JSON.
        const row = JSON.parse(line);
        if (table.preImport) {
          await table.preImport(db, row);
        }
        columnImporters.forEach(importer => importer(row, newIds));

        const values = columnNames.map(c => row[c]);
        const {insertId} = await db.exec`
          insert into ${tableNameSql} (${columnNamesSql})
          values (${values});
        `;

        if (newTableIds) {
          newTableIds.set(index, insertId);
          index++;
        }
      }

      const lastLine = await lines.read();
      if (lastLine !== null) {
        throw new Error(`Unexpected data after last table: ${lastLine}`);
      }
    }
  });

  logger.info(`Import finished in ${Date.now() - startTime} ms`);
};
