const schema = require('../database/schema');
const getNewIdMap = require('./get-new-id-map');
const fileFacts = require('./dump-file-facts');

// The entire exporter is built around a few central assumptions:
//
// 1. If a table has a column named `id`, it is the primary key in that table,
//    and no other column is part of the PK.
// 2. Any column named `id` is also auto-incremented.

const getColumnExporters = table =>
  table.columns
    .filter(c =>
      c.references && c.references.column === 'id' ||
      c.export
    )
    .map(c => {
      // If a column has both an exporter and a reference, always prefer
      // the custom exporter. It will have to deal with updating foreign
      // key references.
      if (c.export) {
        return (row, newIds) => {
          row[c.name] = c.export(row[c.name], newIds);
        };
      } else {
        return (row, newIds) => {
          const newId = newIds[c.references.table].get(row[c.name]);
          row[c.name] = newId;
        };
      }
    });

const writeOutput = (stream, data) => new Promise(resolve => {
  if (!stream.write(data)) {
    // Wait for the buffer to be flushed before we continue
    stream.once('drain', () => resolve());
  } else {
    // Continue right away.
    resolve();
  }
});

const exportDatabase = async (logger, db, outputStream) => {
  const startTime = Date.now();
  logger.info('Starting database export.');

  const newIds = getNewIdMap(schema);

  // First, write some metadata about the export!
  const meta = {
    schemaVersion: schema.version,
    exportDate: (new Date()).toISOString(),
  };
  await writeOutput(
    outputStream,
    `${fileFacts.header}\n${JSON.stringify(meta)}\n${fileFacts.separator}\n`
  );

  for (const table of schema) {
    if (table.skipExport) {
      logger.debug(`Table '${table.name}' should not be exported; skipping.`);
      continue;
    }

    logger.debug(`Exporting table: ${table.name}`);
    // Start of table: just the name
    await writeOutput(outputStream, `${table.name}\n`);

    const newTableIds = newIds[table.name];
    const columnExporters = getColumnExporters(table);

    // TODO: Stream rows from the database, rather than fetching every single
    // one in one go.
    const rows = await db.all`
      select *
      from ${db.raw(table.name)}
    `;
    let index = 0;
    for (const row of rows) {
      if (row.id) {
        if (newTableIds) {
          newTableIds.set(row.id, index);
          index++;
        }
        delete row.id;
      }
      columnExporters.forEach(updater => updater(row, newIds));
      await writeOutput(outputStream, JSON.stringify(row) + '\n');
    }

    // End of table
    await writeOutput(outputStream, '---\n');

    logger.debug(`Total rows exported: ${rows.length}`);
  }

  logger.info(`Export finished in ${Date.now() - startTime} ms.`);
};

module.exports = exportDatabase;
