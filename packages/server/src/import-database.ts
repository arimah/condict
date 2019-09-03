import fs from 'fs';

import {Logger} from 'winston';

import {createPool} from './database';
import importDatabaseImpl from './database/import';
import performStartupChecks from './startup-checks';
import {ServerConfig} from './types';

const importDatabase = (
  logger: Logger,
  config: ServerConfig,
  inputFile: string
): Promise<void> =>
  // Mixing Node's ancient async APIs with Promises... gross.
  new Promise<void>((resolve, reject) => {
    const databasePool = createPool(logger, config.database);

    const inputStream = fs.createReadStream(inputFile);
    // If anything goes wrong with the stream, e.g. the disk is unplugged
    // or whatever, we have to reject the outer promise.
    inputStream.once('error', err => reject(err));

    // We have to run startup checks before importing the database, as this
    // will verify the schema and other nice things.
    performStartupChecks(logger, config, databasePool)
      .then(async () => {
        const db = await databasePool.getConnection();
        await importDatabaseImpl(logger, db, inputStream);
        db.release();
        await databasePool.close();
      })
      .then(resolve)
      .catch(err => reject(err));
  });

export default importDatabase;
