#!/usr/bin/env node

import parseCliArgs, {OptionDefinition} from 'command-line-args';

import createLogger from './create-logger';
import parseConfig from './parse-config';
import CondictServer from './server';
import CondictHttpServer from './http-server';
import importDatabase from './import-database';
import exportDatabase from './export-database';
import getTableSchema from './table-schema';
import {ServerConfig, Logger} from './types';

// Fall back to development if missing. Ensures we get proper console
// logging and other nice things.
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

const globalOptions: OptionDefinition[] = [
  {name: 'config', alias: 'c', type: String},
  {name: 'command', type: String, defaultOption: true},
];

const exportOptions: OptionDefinition[] = [
  {name: 'target', alias: 't', type: String, defaultOption: true},
];

const importOptions: OptionDefinition[] = [
  {name: 'source', alias: 's', type: String, defaultOption: true},
];

const viewTableSchemaOptions: OptionDefinition[] = [
  {name: 'table', alias: 't', type: String, defaultOption: true},
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
  const args = parseCliArgs(globalOptions, {stopAtFirstUnknown: true});

  let config: ServerConfig;
  try {
    config = parseConfig(args.config || 'config.json');
  } catch (e) {
    console.error(
      `Failed to read config from ${args.config || 'config.json'}: ${e}`
    );
    process.exitCode = 1;
    return;
  }

  const logger = createLogger(config.log);

  try {
    const command = args.command as string | undefined;
    switch (command) {
      case 'start':
      case undefined: {
        await start(logger, config);
        break;
      }
      case 'export': {
        const cmdArgs = parseCliArgs(exportOptions, {
          argv: args._unknown || [],
        });
        await exportDatabase(logger, config, cmdArgs.target as string);
        break;
      }
      case 'import': {
        const cmdArgs = parseCliArgs(importOptions, {
          argv: args._unknown || [],
        });
        await importDatabase(logger, config, cmdArgs.source as string);
        break;
      }
      case 'view-table-schema': {
        const cmdArgs = parseCliArgs(viewTableSchemaOptions, {
          argv: args._unknown || [],
        });
        printSchema(config, (cmdArgs.table as string | null | undefined) || null);
        break;
      }
      default:
        console.error(`Unknown command: ${command}`);
        break;
    }
  } catch (e) {
    logger.error(`Unhandled server error: ${e}\n${e.stack}`);
    process.exitCode = 1;
  }
};

main();
