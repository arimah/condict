import fs from 'fs';
import path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';

const localDepPattern = /^\.\.?\//;

export const getExternal = pkg => {
  const dependencies = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ]);

  const devDependencies = new Set(Object.keys(pkg.devDependencies));

  const isDependency = (deps, id) => {
    if (!localDepPattern.test(id)) {
      if (deps.has(id)) {
        return true;
      }

      for (const dep of deps) {
        // Catch submodule imports like `mdi-react/SomethingIcon`.
        if (id.startsWith(`${dep}/`)) {
          return true;
        }
      }
    }
    return false;
  };

  return id => {
    if (isDependency(dependencies, id)) {
      return true;
    }
    if (isDependency(devDependencies, id)) {
      console.warn(`(!) Package ${pkg.name} imports dev dependency ${id}`);
      return true;
    }
    return false;
  };
};

export const getPlugins = (options = {}) => {
  const {
    env = 'production',
    browser = true,
    declarationDir = null,
    packagePath = '.',
  } = options;

  return [
    // Resolve node modules in addition to local modules.
    nodeResolve({
      browser,
    }),

    typescript({
      tsconfig: `${packagePath}/tsconfig.json`,
      rootDir: `./src`,
      // TODO: Remove this when it's no longer necessary
      exclude: [`${packagePath}/dev/**/*`],
      noEmitOnError: false,
      ...declarationDir ? {
        declaration: true,
        declarationDir,
      } : null,
    }),

    // Rollup only resolves ES2015 modules by default, so make it work with
    // CommonJS modules too.
    commonjs({
      exclude: [`${packagePath}/src/**`],
    }),

    // Replace process.env.NODE_ENV with the current environment, to allow some
    // packages to use production versions.
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),

    // Allow JSON files to be imported as modules.
    json({
      compact: true,
    }),
  ];
};

export const configureTarget = (pkg, output, options = {}) => {
  const env = process.env.NODE_ENV || 'production';
  const {
    entry,
    browser = true,
    external = getExternal(pkg),
    packagePath = '.',
    declarations = false,
  } = options;

  // 'output' arrives without packagePath, so we need to prefix it.
  const realOutput = `${packagePath}/${output}`;

  const input = entry
    ? `${packagePath}/${entry}`
    : fs.existsSync(`${packagePath}/src/index.tsx`)
      ? `${packagePath}/src/index.tsx`
      : `${packagePath}/src/index.ts`;

  return {
    input,

    output: {
      format: 'cjs',
      exports: 'named',
      sourcemap: false,
      ...declarations ? {
        dir: path.dirname(realOutput),
      } : {
        file: realOutput,
      },
    },

    external,

    plugins: getPlugins({
      env,
      browser,
      declarationDir: declarations && path.dirname(realOutput),
      packagePath,
    }),

    onwarn: (warning, warn) => {
      // Circular dependencies are common in TS when importing types, and
      // are not detrimental in any way.
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        return;
      }

      // The TypeScript plugin does not prepend the source location of errors
      // for whatever reason. So let's add them ourselves.
      if (
        warning.code === 'PLUGIN_WARNING' &&
        warning.plugin === 'typescript' &&
        warning.loc
      ) {
        const {file, column, line} = warning.loc;
        const relativePath = path.relative(process.cwd(), file);
        // NB: warning.frame starts with a newline.
        warning = {
          ...warning,
          frame: `${relativePath}:${line}:${column}${warning.frame}`,
        };
      }

      warn(warning);
    },
  };
};

const configureDefault = (pkg, options = {}) => {
  const external = getExternal(pkg);

  let targets = [
    configureTarget(pkg, pkg.main, {
      external,
      declarations: true,
      ...options,
    }),
  ];

  const {binEntries} = options;
  if (binEntries) {
    const binExternal = id => {
      if (external(id)) {
        return true;
      }

      if (localDepPattern.test(id) && id !== '.') {
        throw new Error(
          `bin entry points can only import local dependencies from '.'; tried to import '${id}'`
        );
      }

      return true;
    };

    targets = targets.concat(
      Object.entries(binEntries)
        .map(([binName, input]) => {
          const output = pkg.bin[binName];
          const config = configureTarget(pkg, output, {
            ...options,
            external: binExternal,
            entry: input,
          });
          return {
            ...config,
            output: {
              ...config.output,
              banner: '#!/usr/bin/env node',
            },
          };
        })
    );
  }

  return targets;
};

export default configureDefault;
