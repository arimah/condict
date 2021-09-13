import parseCliArgs, {OptionDefinition} from 'command-line-args';

import {
  CondictServer,
  CondictHttpServer,
  Logger,
  ServerConfig,
  ServerConfigWithLogger,
  createLogger,
  loadConfigFile,
  getTableSchema,
} from '.';
import {addUser, editUser, logOutUser, deleteUser} from './manage-users';

type MaybeString = string | null | undefined;
type MaybeNumber = number | null | undefined;

const globalOptions: OptionDefinition[] = [
  {name: 'config', alias: 'c', type: String},
  {name: 'command', type: String, defaultOption: true},
];

const commandOptions: Record<string, OptionDefinition[]> = {
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
  'log-out-user': [
    {name: 'user', alias: 'u', type: String, defaultOption: true},
    {name: 'id', type: Number},
  ],
  'delete-user': [
    {name: 'user', alias: 'u', type: String, defaultOption: true},
    {name: 'id', type: Number},
  ],
};

const printSchema = (config: ServerConfig, tableName: string | null) => {
  const schema = getTableSchema(tableName);
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

  let shuttingDown = false;
  const gracefulShutdown = (signal: NodeJS.Signals) => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;

    logger.info(`Exit: ${signal}`);

    void httpServer.stop().then(() => {
      logger.info('Goodbye!');
    });
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);

  const {url} = await httpServer.start();
  logger.info(`Server listening on ${url}`);
};

const main = async () => {
  const args = parseCliArgs(globalOptions, {stopAtFirstUnknown: true});

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const configFile: string = args.config || 'config.json';
  let config: ServerConfigWithLogger;
  try {
    config = loadConfigFile(configFile);
  } catch (e) {
    console.error(`Failed to read config from ${configFile}: ${e}`);
    process.exitCode = 1;
    return;
  }

  const logger = createLogger(config.log);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
      case 'view-table-schema': {
        const table = (cmdArgs.table as MaybeString) || null;
        printSchema(config, table);
        break;
      }
      case 'add-user':
        await addUser(
          logger,
          config,
          cmdArgs.name as MaybeString,
          cmdArgs.password as MaybeString
        );
        break;
      case 'edit-user': {
        const userName = cmdArgs.user as MaybeString;
        const userId = cmdArgs.id as MaybeNumber;
        const userNameOrId = userId ?? userName;
        if (userNameOrId == null) {
          console.error(`Please specify a user to edit (by name or '--id')`);
          process.exitCode = 2;
          break;
        }
        await editUser(
          logger,
          config,
          userNameOrId,
          cmdArgs['new-name'] as MaybeString,
          cmdArgs['new-password'] as MaybeString
        );
        break;
      }
      case 'log-out-user': {
        const userName = cmdArgs.user as MaybeString;
        const userId = cmdArgs.id as MaybeNumber;
        const userNameOrId = userId ?? userName;
        if (userNameOrId == null) {
          console.error(`Please specify a user to log out (by name or '--id')`);
          process.exitCode = 2;
          break;
        }
        await logOutUser(logger, config, userNameOrId);
        break;
      }
      case 'delete-user': {
        const userName = cmdArgs.user as MaybeString;
        const userId = cmdArgs.id as MaybeNumber;
        const userNameOrId = userId ?? userName;
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
    const err = e as Error;
    logger.error(`Unhandled server error: ${err.message}\n${err.stack}`);
    process.exitCode = 1;
  }
};

void main();
