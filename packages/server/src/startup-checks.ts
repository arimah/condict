import ensureSchemaIsValid from './database/validate-schema';
import {Pool as DatabasePool} from './database/types';
import {ServerConfig, Logger} from './types';

const performStartupChecks = async (
  logger: Logger,
  config: ServerConfig,
  databasePool: DatabasePool
) => {
  await ensureSchemaIsValid(logger, config, databasePool);
};

export default performStartupChecks;
