const path = require('path');

const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const buildPath = path.resolve(__dirname, 'build');

module.exports = {
  // In this package, Webpack is ONLY used during development, to test the
  // various components.
  mode: 'development',

  entry: path.resolve(__dirname, 'src/index.js'),

  output: {
    filename: 'main.js',
    path: buildPath,
  },

  devtool: 'cheap-source-map',

  devServer: {
    contentBase: buildPath,
    port: 3040,
    hot: true,
    host: process.env.WEBPACK_HOST || 'localhost',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@condict/babel-preset-react',
            ],
          },
        },
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(['build']),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html'),
      minify: true,
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
};
