import path from 'path';

import {getExternal, getPlugins, onwarn} from '../../config/rollup.base.js';

import pkg from './package.json';

const env = process.env.NODE_ENV || 'production';

// electron needs to be a dev dependency, but we obviously want to be able to
// import from it regardless (without warning).
pkg.dependencies['electron'] = true;

const external = getExternal(pkg);

const isExternalRenderer = env === 'development'
  ? external
  : id => id === 'electron' || id.startsWith('electron/');

// On Windows, paths sometimes inconsistently use `/` instead of `\`, so let's
// normalize them.
const normalizePath = path.sep === '\\' ? path.normalize : p => p;

const mainDir = normalizePath(path.resolve('./src/main')) + path.sep;
const rendererDir = normalizePath(path.resolve('./src/renderer')) + path.sep;

export default [
  {
    input: './src/renderer/index.tsx',

    output: {
      file: './dist/renderer.js',
      format: 'cjs',
      exports: 'none',
      sourcemap: false,
      interop: 'auto',
      generatedCode: 'es2015',
      externalLiveBindings: false,
    },

    external: id => {
      if (isExternalRenderer(id)) {
        return true;
      }

      if (path.isAbsolute(id) && normalizePath(id).startsWith(mainDir)) {
        throw new Error(`Renderer references main module ${id}`);
      }
      return false;
    },

    plugins: getPlugins({
      env,
      browser: true,
      packagePath: '.',
      declarationDir: null,
      cacheDir: './.buildcache/renderer',
      tsBuildInfoFile: './dist/.renderer.tsbuildinfo',
    }),

    onwarn,
  },
  {
    input: './src/main/index.ts',

    output: {
      file: './dist/main.js',
      format: 'cjs',
      exports: 'none',
      sourcemap: false,
      interop: 'auto',
      generatedCode: 'es2015',
      externalLiveBindings: false,
    },

    external: id => {
      if (external(id)) {
        return true;
      }

      if (path.isAbsolute(id) && normalizePath(id).startsWith(rendererDir)) {
        throw new Error(`Main references renderer module ${id}`);
      }

      return false;
    },

    plugins: getPlugins({
      env,
      browser: false,
      packagePath: '.',
      declarationDir: null,
      cacheDir: './.buildcache/main',
      tsBuildInfoFile: './dist/.main.tsbuildinfo',
    }),

    onwarn,
  },
];
