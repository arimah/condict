const path = require('path');
const CondictDevServer = require('@condict/dev-server');
CondictDevServer({
  entry: path.resolve(__dirname, 'app.js'),
  title: 'Admin UI components',
  port: 3030,
});
