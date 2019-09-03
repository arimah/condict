#!/usr/bin/env node

import parseCliArgs, {OptionDefinition} from 'command-line-args';
import {Logger} from 'winston';

import createLogger from './create-logger';
import parseConfig from './parse-config';
import CondictServer from './server';
import CondictHttpServer from './http-server';
import importDatabase from './import-database';
import exportDatabase from './export-database';
import getTableSchema from './table-schema';
import {ServerConfig} from './types';

// Fall back to development if missing. Ensures we get proper console
// logging and other nice things.
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

const options: OptionDefinition[] = [
  {name: 'config', alias: 'c', type: String},

  {name: 'export', type: Boolean},
  {name: 'target', type: String},

  {name: 'import', type: Boolean},
  {name: 'source', type: String},

  {name: 'view-table-schema', type: String},
];

const printSchema = (config: ServerConfig, tableName: string | null) => {
  const schema = getTableSchema(config.database.type, tableName);
  if (schema === null) {
    console.error(`Table not found: ${tableName}`);
    process.exitCode = 2;
  } else {
    console.log(schema);
  }
};

const start = async (logger: Logger, config: ServerConfig) => {
  const server = new CondictServer(logger, config);
  const httpServer = new CondictHttpServer(server);

  process.on('SIGINT', async () => {
    logger.info('Exit: Ctrl+C');

    logger.info('Stopping server...');
    await httpServer.stop();

    logger.info('Goodbye!');
  });

  const {url} = await httpServer.start();
  logger.info(`Server listening on ${url}`);
};

const main = async () => {
  const args = parseCliArgs(options);

  let config: ServerConfig;
  try {
    config = parseConfig(args.config || 'config.json');
  } catch (e) {
    console.error(`Failed to read config from ${args.config || 'config.json'}: ${e}`);
    process.exitCode = 1;
    return;
  }

  const logger = createLogger(config.log);

  try {
    if (args.export) {
      await importDatabase(logger, config, args.target as string);
    } else if (args.import) {
      await exportDatabase(logger, config, args.source as string);
    } else if (args['view-table-schema'] !== undefined) {
      printSchema(config, args['view-table-schema'] as string | null);
    } else {
      await start(logger, config);
    }
  } catch (e) {
    logger.error(`Unhandled server error: ${e}\n${e.stack}`);
    process.exitCode = 1;
  }
};

main();
