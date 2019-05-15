const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin');

module.exports = ({entry, contentBase, title, template}) => ({
  // This server is ONLY used during development.
  mode: 'development',

  entry,

  output: {
    filename: 'main.js',
  },

  devtool: 'cheap-source-map',

  devServer: {
    contentBase,
    hot: true,
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
    new HtmlWebpackPlugin({
      template,
      minify: true,
    }),
    new HtmlReplaceWebpackPlugin([
      {
        pattern: '@@title@@',
        replacement: title,
      }
    ]),
    new webpack.HotModuleReplacementPlugin(),
  ],
});
