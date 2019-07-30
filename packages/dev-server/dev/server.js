const path = require('path');

const condictDevServer = require('../src');

condictDevServer({
  entry: path.resolve(__dirname, 'app.js'),
  contentBase: __dirname,
  title: 'Condict dev server test',
});
