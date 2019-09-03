import fs from 'fs';

import {Logger} from 'winston';

import {createPool} from './database';
import exportDatabaseImpl from './database/export';
import performStartupChecks from './startup-checks';
import {ServerConfig} from './types';

const exportDatabase = (
  logger: Logger,
  config: ServerConfig,
  outputFile: string
): Promise<void> =>
  // Mixing Node's ancient async APIs with Promises... gross.
  new Promise<void>((resolve, reject) => {
    const databasePool = createPool(logger, config.database);

    const outputStream = fs.createWriteStream(outputFile);
    // If anything goes wrong with the stream, e.g. the disk is unplugged
    // or whatever, we have to reject the outer promise.
    outputStream.once('error', err => reject(err));

    // We have to run startup checks before exporting the database, as this
    // will verify the schema and other nice things.
    performStartupChecks(logger, config, databasePool)
      .then(async () => {
        const db = await databasePool.getConnection();
        await exportDatabaseImpl(logger, db, outputStream);
        db.release();
        await databasePool.close();
      })
      .then(() => {
        // Have to wait until the file has been fully written, otherwise
        // process.exit() might result in partial data.
        outputStream.end(resolve);
      })
      .catch(err => reject(err));
  });

export default exportDatabase;
