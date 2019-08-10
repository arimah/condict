import * as path from 'path';

import Webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import chalk from 'chalk';

import getWebpackConfig from './webpack.config';

type Options = {
  entry: string;
  rootDir: string;
  contentBase?: string;
  title?: string;
  template?: string;
  port?: number;
  host?: string;
};

export function start(options: Options) {
  const {entry, rootDir} = options;
  if (!entry) {
    throw new Error('Dev server option missing: entry');
  }

  const port =
    options.port ||
    process.env.WEBPACK_PORT && parseInt(process.env.WEBPACK_PORT, 10) ||
    3000;
  const host =
    options.host ||
    process.env.WEBPACK_HOST ||
    'localhost';

  const webpackConfig = getWebpackConfig({
    entry,
    rootDir,
    contentBase: options.contentBase || rootDir,
    title: options.title || 'Condict dev server',
    template: options.template || path.resolve(__dirname, '../templates/default.html'),
  });

  const compiler = Webpack(webpackConfig);
  const server = new WebpackDevServer(compiler, webpackConfig.devServer);

  server.listen(port, host, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on ${chalk.cyan(`http://${host}:${port}`)}`);
  });

  process.on('SIGINT', () => {
    server.close();
  });
}
