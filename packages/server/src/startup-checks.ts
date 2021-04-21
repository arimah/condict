import {Connection, ensureSchemaIsValid} from './database';
import {ServerConfig, Logger} from './types';

const performStartupChecks = async (
  logger: Logger,
  config: ServerConfig,
  connection: Connection
): Promise<void> => {
  await ensureSchemaIsValid(logger, config, connection);
};

export default performStartupChecks;
