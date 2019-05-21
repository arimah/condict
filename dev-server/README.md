# Condict dev server

The `@condict/dev-server` package is a thin wrapper around [Webpack Dev Server][webpack-dev-server], designed to be used from Condict packages that require a dev server for things such as testing components.

Unlike Webpack's dev server, this package is _intended_ to be started from its API, not the command line. The reason for this is that it must be passed several paths that are specific to the package being developed.

The Condict dev server configures Babel using [`@condict/babel-preset-react`][babel-preset].

## Usage

```js
const path = require('path');
const CondictDevServer = require('@condict/dev-server');

CondictDevServer({
  // Your dev server's entry point.
  entry: path.resolve(__dirname, 'app.js'),

  // The directory to serve static content from.
  contentBase: path.resolve(__dirname, 'assets'),

  // The title of the dev server page.
  title: 'My components - test page',

  // The HTML template for the dev server page.
  template: path.resolve(__dirname, 'index.html'),

  // The HTTP port to serve the dev server on.
  port: 3333,

  // The hostname to serve the dev server on.
  host: 'localhost',
});
```

The module exports a function, `CondictDevServer`, which takes an object of options. The available options are:

| Name | Type | Description|
| --- | --- | --- |
| `entry` | string or string[] | Defines the dev server's entry point. This correspond's to Webpack's `entry` option. This should be an absolute path. |
| `contentBase` | string | Optional. The directory from which to serve static content, such as image assets. Defaults to `false`, which disables static content serving altogether. |
| `title` | string | Optional. The title of the dev server page. This value replaces the placeholder `@@title@@` within the HTML template. Defaults to "Condict dev server". |
| `template` | string | Optional. The path to an HTML file that is used as the dev server template. The default template is [`src/index.html`](./src/index.html). The placeholder `@@title@@` is replaced by the value of the `title` option. |
| `port` | number | Optional. The port number that the dev server listens on. Defaults to the environment variable `WEBPACK_PORT` when present, or `3000` otherwise. |
| `host` | string | Optional. The hostname that the dev server listens to. Defaults to the environment variable `WEBPACK_HOST` when present, or `'localhost'` otherwise. |

[webpack-dev-server]: https://webpack.js.org/configuration/dev-server/
[babel-preset]: ../babel-preset-react
