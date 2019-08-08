const path = require('path');
const CondictDevServer = require('@condict/dev-server');
CondictDevServer.start({
  entry: path.resolve(__dirname, 'app'),
  rootDir: [__dirname, path.resolve(__dirname, '../src')],
  title: 'UI components',
  port: 3030,
});
