# @condict/app

This is the main [Electron][] app for Condict. The app is **not fully functional**. Some functionality is implemented, but it is not currently possible to really browse a dictionary or manage certain resources.

## A note on dependencies

When the app is packaged for distribution, `devDependencies` are excluded. The renderer code is bundled into a single .js file where the only `require()` is for the [Electron][] module. Every dependency that is used exclusively by the renderer is therefore in `devDependencies`. Dependencies that are used by the main process **must** be placed in `dependencies`.

[electron]: https://www.electronjs.org/
