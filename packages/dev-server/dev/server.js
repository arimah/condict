const path = require('path');

const CondictDevServer = require('../dist');

CondictDevServer.start({
  entry: path.resolve(__dirname, 'app'),
  rootDir: [__dirname, path.resolve(__dirname, '../src')],
  contentBase: __dirname,
  title: 'Condict dev server test',
});
