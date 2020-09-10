import {ServerConfig, Logger} from '../types';

import {Connection, ConnectionPool} from './sqlite';
import schema, {schemaVersion as serverSchemaVersion} from './schema';

const getSchemaVersion = (db: Connection) => {
  // FIXME: https://github.com/typescript-eslint/typescript-eslint/issues/2452
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type Row = { value: string };

  const hasSchemaInfo = db.tableExists('schema_info');
  if (!hasSchemaInfo) {
    return null;
  }

  const result = db.get<Row>`
    select value
    from schema_info
    where name = 'schema_version'
  `;

  if (result === null) {
    return null;
  }
  return +result.value;
};

const createSchema = (
  logger: Logger,
  db: Connection,
  config: ServerConfig,
  isNewSchema: boolean
) => {
  for (const {name, commands} of schema) {
    const tableExists = db.tableExists(name);
    if (tableExists) {
      if (isNewSchema) {
        logger.warn(`Skipping existing table: ${name}`);
      }
      continue;
    }

    if (!isNewSchema) {
      logger.warn(`Creating missing table: ${name}`);
    }

    for (const command of commands) {
      db.exec(command);
    }
  }

  if (isNewSchema) {
    db.exec`
      insert into schema_info (name, value)
      values ('schema_version', ${String(serverSchemaVersion)})
    `;
  }
};

const createNewSchema = (
  logger: Logger,
  db: Connection,
  config: ServerConfig
) => {
  logger.info(
    'No schema_info or schema version found: initializing new database.'
  );
  return createSchema(logger, db, config, true);
};

const verifySchema = (logger: Logger, db: Connection, config: ServerConfig) => {
  logger.info('Database schema is up to date. Verifying existing tables.');
  return createSchema(logger, db, config, false);
};

const migrateSchema = (
  logger: Logger,
  db: Connection,
  config: ServerConfig,
  schemaVersion: number
) => {
  logger.info(
    `Found schema version ${schemaVersion}; migrating to ${serverSchemaVersion}`
  );
  // TODO: Support for migrations
  throw new Error('Migrations are not yet implemented');
};

const ensureSchemaIsValid = async (
  logger: Logger,
  config: ServerConfig,
  databasePool: ConnectionPool
): Promise<void> => {
  const db = await databasePool.getConnection();
  try {
    const schemaVersion = getSchemaVersion(db);
    if (schemaVersion === null) {
      createNewSchema(logger, db, config);
    } else if (schemaVersion < serverSchemaVersion) {
      migrateSchema(logger, db, config, schemaVersion);
    } else if (schemaVersion === serverSchemaVersion) {
      verifySchema(logger, db, config);
    } else if (schemaVersion > serverSchemaVersion) {
      throw new Error(
        `Database schema version is too high! (database = ${
          schemaVersion
        }, server = ${serverSchemaVersion})`
      );
    }
  } finally {
    // Always return the db connection even if something goes wrong
    await db.release();
  }
};

export default ensureSchemaIsValid;
