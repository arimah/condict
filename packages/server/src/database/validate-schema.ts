import {ServerConfig, Logger} from '../types';

import {generateSchema} from '.';
import Adaptor from './adaptor';
import {Pool as DatabasePool} from './types';
import {schemaVersion as serverSchemaVersion} from './schema';

const getSchemaVersion = async (db: Adaptor) => {
  type Row = { value: string };

  const hasSchemaInfo = await db.tableExists('schema_info');
  if (!hasSchemaInfo) {
    return null;
  }

  const result = await db.get<Row>`
    select value
    from schema_info
    where name = 'schema_version'
  `;

  if (result === null) {
    return null;
  }
  return +result.value;
};

const createSchema = async (
  logger: Logger,
  db: Adaptor,
  config: ServerConfig,
  isNewSchema: boolean
) => {
  const schema = generateSchema(config.database.type);

  for (const [tableName, statements] of schema) {
    const tableExists = await db.tableExists(tableName);
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
      await db.exec(statement);
    }
  }

  if (isNewSchema) {
    await db.exec`
      insert into schema_info (name, value)
      values ('schema_version', ${String(serverSchemaVersion)})
    `;
  }
};

const createNewSchema = (logger: Logger, db: Adaptor, config: ServerConfig) => {
  logger.info('No schema_info or schema version found: initializing new database.');
  return createSchema(logger, db, config, true);
};

const verifySchema = (logger: Logger, db: Adaptor, config: ServerConfig) => {
  logger.info('Database schema is up to date. Verifying existing tables.');
  return createSchema(logger, db, config, false);
};

const migrateSchema = async (
  logger: Logger,
  db: Adaptor,
  config: ServerConfig,
  schemaVersion: number
) => {
  logger.info(`Found schema version ${schemaVersion}; migrating to ${serverSchemaVersion}`);
  // TODO: Support for migrations
  throw new Error('Migrations are not yet implemented');
};

const ensureSchemaIsValid = async (
  logger: Logger,
  config: ServerConfig,
  databasePool: DatabasePool
): Promise<void> => {
  const db = await databasePool.getConnection();
  try {
    const schemaVersion = await getSchemaVersion(db);
    if (schemaVersion === null) {
      await createNewSchema(logger, db, config);
    } else if (schemaVersion < serverSchemaVersion) {
      await migrateSchema(logger, db, config, schemaVersion);
    } else if (schemaVersion === serverSchemaVersion) {
      await verifySchema(logger, db, config);
    } else if (schemaVersion > serverSchemaVersion) {
      throw new Error(
        `Database schema version is too high! (database = ${schemaVersion}, server = ${serverSchemaVersion})`
      );
    }
  } finally {
    // Always return the db connection even if something goes wrong
    db.release();
  }
};

export default ensureSchemaIsValid;
