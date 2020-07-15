import {ServerConfig, Logger} from '../types';

import {generateSchema} from '.';
import {Connection, ConnectionPool} from './sqlite';
import {schemaVersion as serverSchemaVersion} from './schema';

const getSchemaVersion = (db: Connection) => {
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
  const schema = generateSchema();

  for (const [tableName, statements] of schema) {
    const tableExists = db.tableExists(tableName);
    if (tableExists) {
      if (isNewSchema) {
        logger.warn(`Skipping existing table: ${tableName}`);
      }
      continue;
    }

    if (!isNewSchema) {
      logger.warn(`Creating missing table: ${tableName}`);
    }

    for (const statement of statements) {
      db.exec(statement);
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
    db.release();
  }
};

export default ensureSchemaIsValid;
