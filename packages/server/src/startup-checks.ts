import {ConnectionPool, ensureSchemaIsValid} from './database';
import {ServerConfig, Logger} from './types';

const performStartupChecks = async (
  logger: Logger,
  config: ServerConfig,
  databasePool: ConnectionPool
): Promise<void> => {
  await ensureSchemaIsValid(logger, config, databasePool);
};

export default performStartupChecks;
