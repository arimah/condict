import {HotModuleReplacementPlugin, Configuration} from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlReplaceWebpackPlugin from 'html-replace-webpack-plugin';
import 'html-replace-webpack-plugin';

type Options = {
  entry: string;
  rootDir: string | string[];
  contentBase?: string;
  title: string;
  template: string;
};

export default ({
  entry,
  rootDir,
  contentBase,
  title,
  template,
}: Options): Configuration => ({
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

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            rootDir: undefined,
            rootDirs: typeof rootDir === 'string' ? [rootDir] : rootDir,
          },
          onlyCompileBundledFiles: true,
        },
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({template}),
    new HtmlReplaceWebpackPlugin([
      {
        pattern: '@@title@@',
        replacement: title,
      },
    ]),
    new HotModuleReplacementPlugin(),
  ],
});
