import parseCliArgs, {OptionDefinition} from 'command-line-args';

import createLogger from './create-logger';
import parseConfig from './parse-config';
import {createServer} from './server';
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
  const server = createServer(logger, config);

  try {
    if (args.export) {
      await server.export(args.target as string);
      await server.close();
    } else if (args.import) {
      await server.import(args.source as string);
      await server.close();
    } else if (args['view-table-schema'] !== undefined) {
      server.viewTableSchema(args['view-table-schema'] as string | null);
      await server.close();
    } else {
      process.on('SIGINT', async () => {
        logger.info('Exit: Ctrl+C');

        logger.info('Stopping server...');
        await server.close();

        logger.info('Goodbye!');
      });

      const {url} = await server.start();
      logger.info(`Server listening on ${url}`);
    }
  } catch (e) {
    logger.error(`Unhandled server error: ${e}\n${e.stack}`);
    await server.close();
    process.exitCode = 1;
  }
};

main();
