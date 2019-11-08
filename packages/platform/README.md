# @condict/platform

A small package that detects the current platform (really, operating system). This package distinguishes between macOS, Windows and the popular operating system Other. Other encompasses anything that isn't macOS or Windows – Linux, BSD, and so on.

This package has two entry points:

* There is a browser-only entry point that uses the [platform][], for testing packages in the browser. When used in this way, the `platform` package _must_ be installed (it is a peer dependency). For testing purposes, if `localStorage` contais a key named `platform`, that will be preferred. It is expected to contain an OS family string from [platform][].
* The main entry point only works in Node, and is intended to be used in Electron (and works in both the main process and the renderer). The platform can be overridden using the environment variable `NODE_PLATFORM`, which is expected to contain a Node.js platform name, as found in [`process.platform`][process-platform].

Note that the browser platform names are different from those in Node.

## Examples

Using exported constants for simple conditional platform behaviour:

```js
import {isMacOS, isWindows, isOther} from '@condict/platform';

const printShortcut = isMacOS ? 'Command+P' : 'Ctrl+P';

const pageTitle = isWindows ? `MyApp - ${pageName}` : 'MyApp';

const useNativeFrame = isOther || isMacOS;
```

Using [`selectPlatform()`](#selectplatform) as an alternative:

```js
import {selectPlatform} from '@condict/platform';

const prevTabShortcut = selectPlatform({
  macos: ['Control+Shift+Tab', 'Command+ArrowLeft'],
  windows: ['Ctrl+Shift+Tab', 'Alt+ArrowLeft'],
  other: ['Ctrl+PageUp', 'Ctrl+Shift+Tab', 'Alt+ArrowLeft'],
});
```

## `isMacOS`, `isWindows`, `isOther`

> `const isMacOS: boolean`
> `const isWindows: boolean`
> `const isOther: boolean`

These constants are true according to the current platform. Exactly one of these constants is true at any time.

## `selectPlatform()`

This function has two overloads:

> `selectPlatform<T>(options: { macOS: T; windows: T; other: T }): T`
> `selectPlatform<T>(options: { macOS?: T; windows?: T; other?: T; default: T }): T`

The first overload requires exactly the three attributes `macOS`, `windows` and `other` and selects one of them. The second overload permits any of them to be omitted, as long as there is a `default` fallback.

[platform]: https://www.npmjs.com/package/platform
[process-platform]: https://nodejs.org/api/process.html#process_process_platform
