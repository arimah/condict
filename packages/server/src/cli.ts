#!/usr/bin/env node

import parseCliArgs, {OptionDefinition} from 'command-line-args';

import createLogger from './create-logger';
import parseConfig from './parse-config';
import CondictServer from './server';
import CondictHttpServer from './http-server';
import importDatabase from './import-database';
import exportDatabase from './export-database';
import getTableSchema from './table-schema';
import {addUser, editUser, deleteUser} from './manage-users';
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

const commandOptions: Record<string, OptionDefinition[]> = {
  export: [
    {name: 'target', alias: 't', type: String, defaultOption: true},
  ],
  import: [
    {name: 'source', alias: 's', type: String, defaultOption: true},
  ],
  'view-table-schema': [
    {name: 'table', alias: 't', type: String, defaultOption: true},
  ],
  'add-user': [
    {name: 'name', alias: 'n', type: String, defaultOption: true},
    {name: 'password', alias: 'p', type: String},
  ],
  'edit-user': [
    {name: 'user', alias: 'u', type: String, defaultOption: true},
    {name: 'id', type: Number},
    {name: 'new-name', alias: 'n', type: String},
    {name: 'new-password', alias: 'p', type: String},
  ],
  'delete-user': [
    {name: 'user', alias: 'u', type: String, defaultOption: true},
    {name: 'id', type: Number},
  ],
};

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

  const cmdArgs = parseCliArgs(commandOptions[args.command] || [], {
    argv: args._unknown || [],
  });

  try {
    const command = args.command as string | undefined;
    switch (command) {
      case 'start':
      case undefined:
        await start(logger, config);
        break;
      case 'export':
        await exportDatabase(logger, config, cmdArgs.target as string);
        break;
      case 'import':
        await importDatabase(logger, config, cmdArgs.source as string);
        break;
      case 'view-table-schema': {
        const table = (cmdArgs.table as string | null | undefined) || null;
        printSchema(config, table);
        break;
      }
      case 'add-user':
        await addUser(
          logger,
          config,
          cmdArgs.name as string | null | undefined,
          cmdArgs.password as string | null | undefined
        );
        break;
      case 'edit-user': {
        const userName = cmdArgs.user as string | null | undefined;
        const userId = cmdArgs.id as number | null | undefined;
        const userNameOrId = userId != null ? userId : userName;
        if (userNameOrId == null) {
          console.error(`Please specify a user to edit (by name or '--id')`);
          process.exitCode = 2;
          break;
        }
        await editUser(
          logger,
          config,
          userNameOrId,
          cmdArgs['new-name'] as string | null | undefined,
          cmdArgs['new-password'] as string | null | undefined
        );
        break;
      }
      case 'delete-user': {
        const userName = cmdArgs.user as string | null | undefined;
        const userId = cmdArgs.id as number | null | undefined;
        const userNameOrId = userId != null ? userId : userName;
        if (userNameOrId == null) {
          console.error(`Please specify a user to delete (by name or '--id')`);
          process.exitCode = 2;
          break;
        }
        await deleteUser(logger, config, userNameOrId);
        break;
      }
      default:
        console.error(`Unknown command: ${command}`);
        process.exitCode = 2;
        break;
    }
  } catch (e) {
    logger.error(`Unhandled server error: ${e}\n${e.stack}`);
    process.exitCode = 1;
  }
};

main();
