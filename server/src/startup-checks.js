const {generateSchema} = require('./database');
const {version: serverSchemaVersion} = require('./database/schema');

const getSchemaVersion = async db => {
  const hasSchemaInfo = await db.tableExists('schema_info');
  if (!hasSchemaInfo) {
    return null;
  }

  const result = await db.get`
    select value
    from schema_info
    where name = 'schema_version'
  `;

  if (result === null) {
    return null;
  }
  return result.value | 0;
};

const createSchema = async (
  logger,
  db,
  config,
  isNewSchema
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

const createNewSchema = async (logger, db, config) => {
  logger.info('No schema_info or schema version found: initializing new database.');
  return createSchema(logger, db, config, true);
};

const verifySchema = async (logger, db, config) => {
  logger.info('Database schema is up to date. Verifying existing tables.');
  return createSchema(logger, db, config, false);
};

const migrateSchema = async (logger, db, config, schemaVersion) => {
  logger.info(`Found schema version ${schemaVersion}; migrating to ${serverSchemaVersion}`);
  // TODO: Support for migrations
  throw new Error('Migrations are not yet implemented');
};

const ensureSchemaIsValid = async (logger, config, databasePool) => {
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

module.exports = async (logger, config, databasePool) => {
  logger.info('Running pre-checks...');
  await ensureSchemaIsValid(logger, config, databasePool);
  logger.info('Pre-checks done.');
};
