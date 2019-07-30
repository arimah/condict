const path = require('path');

const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const chalk = require('chalk');

const getWebpackConfig = require('./webpack.config');

module.exports = options => {
  const {contentBase, entry, title, template} = options;
  if (!entry) {
    throw new Error('Dev server option missing: entry');
  }

  const port = options.port || parseInt(process.env.WEBPACK_PORT, 10) || 3000;
  const host = options.host || process.env.WEBPACK_HOST || 'localhost';

  const webpackConfig = getWebpackConfig({
    entry,
    contentBase: contentBase || false,
    title: title || 'Condict dev server',
    template: template || path.resolve(__dirname, 'index.html'),
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
};
