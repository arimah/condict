import {WriteStream} from 'fs';

import {Logger} from 'winston';

import Adaptor from './adaptor';
import fileFacts from './dump-file-facts';
import getNewIdMap from './get-new-id-map';
import schema, {schemaVersion} from './schema';
import {
  TableSchema,
  FKColumnSchema,
  ForeignKeyRef,
  NewIdMap,
  isFKColumn,
} from './schema/types';

// The entire exporter is built around a few central assumptions:
//
// 1. If a table has a column named `id`, it is the primary key in that table,
//    and no other column is part of the PK.
// 2. Any column named `id` is also auto-incremented.

const getColumnExporters = (table: TableSchema) =>
  table.columns
    .filter(c =>
      isFKColumn(c) && c.references.column === 'id' ||
      c.export
    )
    .map(c => {
      // If a column has both an exporter and a reference, always prefer
      // the custom exporter. It will have to deal with updating foreign
      // key references.
      if (c.export) {
        const exportFn = c.export;
        return (row: any, newIds: NewIdMap) => {
          row[c.name] = exportFn(row[c.name], newIds);
        };
      } else {
        const ref = (c as FKColumnSchema).references;
        return (row: any, newIds: NewIdMap) => {
          const newId = newIds[ref.table].get(row[c.name]);
          row[c.name] = newId;
        };
      }
    });

const writeOutput = (stream: WriteStream, data: string) => new Promise<void>(
  resolve => {
    if (!stream.write(data)) {
      // Wait for the buffer to be flushed before we continue
      stream.once('drain', () => resolve());
    } else {
      // Continue right away.
      resolve();
    }
  }
);

const exportDatabase = async (
  logger: Logger,
  db: Adaptor,
  outputStream: WriteStream
) => {
  const startTime = Date.now();
  logger.info('Starting database export.');

  const newIds = getNewIdMap(schema);

  // First, write some metadata about the export!
  const meta = {
    schemaVersion: schemaVersion,
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
    const rows = await db.all<{id: number}>`
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
    await writeOutput(outputStream, `${fileFacts.separator}\n`);

    logger.debug(`Total rows exported: ${rows.length}`);
  }

  logger.info(`Export finished in ${Date.now() - startTime} ms.`);
};

export default exportDatabase;
