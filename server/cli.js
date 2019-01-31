const parseCliArgs = require('command-line-args');

const createLogger = require('./src/create-logger');
const parseConfig = require('./src/parse-config');
const condict = require('./src/server');

// Fall back to development if missing. Ensures we get proper console
// logging and other nice things.
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

const options = [
  {name: 'config', alias: 'c', type: String},

  {name: 'export', type: Boolean},
  {name: 'target', type: String},

  {name: 'import', type: Boolean},
  {name: 'source', type: String},

  {name: 'view-table-schema', type: String},
];

const main = async () => {
  const args = parseCliArgs(options);

  let config;
  try {
    config = parseConfig(args.config || '.env');
  } catch (e) {
    console.error(`Failed to read config from .env: ${e}`);
    process.exitCode = 1;
    return;
  }

  const logger = createLogger(config.log);
  const server = condict.createServer(logger, config);

  try {
    if (args.export) {
      await server.export(args.target);
      await server.close();
    } else if (args.import) {
      await server.import(args.source);
      await server.close();
    } else if (args['view-table-schema'] !== undefined) {
      server.viewTableSchema(args['view-table-schema']);
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
