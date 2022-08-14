import fs from 'fs';
import path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';

const localDepPattern = /^\.\.?\//;

export const getExternal = (pkg, allowDev = false) => {
  // Map from module ID to true (known external) or false (known non-external).
  const dependencies = new Map(
    [].concat(Object.keys(pkg.dependencies || {}))
      .concat(Object.keys(pkg.peerDependencies || {}))
      .map(d => [d, true])
  );
  // Same as above
  const devDependencies = new Map(
    Object.keys(pkg.devDependencies || {})
      .map(d => [d, true])
  );

  const isDependency = (deps, id) => {
    if (!localDepPattern.test(id)) {
      if (deps.has(id)) {
        return deps.get(id);
      }

      for (const dep of deps.keys()) {
        // Catch submodule imports like `mdi-react/SomethingIcon`.
        if (id.startsWith(`${dep}/`)) {
          // Known external dependency; cache it.
          deps.set(id, true);
          return true;
        }
      }

      // Known non-external dependency; cache it.
      deps.set(id, false);
    }
    return false;
  };

  return id => {
    if (isDependency(dependencies, id)) {
      return true;
    }
    if (isDependency(devDependencies, id)) {
      if (!allowDev) {
        console.warn(`(!) Package ${pkg.name} imports dev dependency ${id}`);
      }
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
    cacheDir = null,
    tsBuildInfoFile = null,
  } = options;

  return [
    // Resolve node modules in addition to local modules.
    nodeResolve({
      browser,
      preferBuiltins: true,
    }),

    typescript({
      tsconfig: `${packagePath}/tsconfig.json`,
      rootDir: `./src`,
      noEmitOnError: false,
      outputToFilesystem: true,
      ...declarationDir ? {
        declaration: true,
        declarationDir,
      } : null,
      ...cacheDir && tsBuildInfoFile ? {
        incremental: true,
        cacheDir,
        tsBuildInfoFile,
      } : null,
    }),

    // Rollup only resolves ES modules by default, so make it work with
    // CommonJS modules too.
    commonjs({
      exclude: [`${packagePath}/src/**`],
    }),

    // Replace process.env.NODE_ENV with the current environment, to allow some
    // packages to use production versions.
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify(env),
      },
    }),

    // Allow JSON files to be imported as modules.
    json({
      compact: true,
    }),
  ];
};

export const onwarn = (warning, warn) => {
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

  const outputName = path.basename(realOutput);

  return {
    input,

    output: [
      {
        format: 'cjs',
        exports: 'named',
        interop: 'auto',
        generatedCode: 'es2015',
        externalLiveBindings: false,
        sourcemap: false,
        ...declarations ? {
          dir: path.dirname(realOutput),
        } : {
          file: realOutput,
        },
      },
      {
        format: 'es',
        exports: 'auto',
        interop: 'auto',
        generatedCode: 'es2015',
        externalLiveBindings: false,
        sourcemap: false,
        file: realOutput.replace(/\.js$/, '.esm.js'),
      }
    ],

    external,

    plugins: getPlugins({
      env,
      browser,
      declarationDir: declarations && path.dirname(realOutput),
      cacheDir: `${packagePath}/.buildcache/${outputName}`,
      tsBuildInfoFile: `${path.dirname(output)}/.${outputName}.tsbuildinfo`,
      packagePath,
    }),

    onwarn,
  };
};

const configureDefault = (pkg, options = {}) => {
  const isExternalDependency = getExternal(pkg);
  let external = isExternalDependency;
  let loadedLocalModules = null;
  if (pkg.binEntries) {
    // Record visited local modules, so we can find out if any are imported
    // multiple times.
    loadedLocalModules = new Map();
    external = id => {
      if (isExternalDependency(id)) {
        return true;
      }
      if (path.isAbsolute(id)) {
        loadedLocalModules.set(id, '<main>');
      }
      return false;
    };
  }

  let targets = [
    configureTarget(pkg, pkg.main, {
      external,
      declarations: true,
      ...options,
    }),
  ];

  if (pkg.binEntries) {
    const binExternal = (id, binName) => {
      if (isExternalDependency(id)) {
        return true;
      }
      if (localDepPattern.test(id)) {
        // Allow the module to be imported. It will be resolved to an absolute
        // path next, which we can check below. The only local module that is
        // always external is '.', which doesn't match localDepPattern.
        return false;
      }
      if (path.isAbsolute(id)) {
        const previousLoader = loadedLocalModules.get(id);
        if (previousLoader && previousLoader !== binName) {
          throw new Error(
            `Local module ${id} has already been loaded by entry point ${
              previousLoader
            }`
          );
        }
        loadedLocalModules.set(id, binName);
        return false;
      }
      // Probably a built-in, like 'fs' or 'path', or the main entry point '.'.
      return true;
    };

    targets = targets.concat(
      Object.entries(pkg.binEntries).map(([binName, input]) => {
        const config = configureTarget(pkg, pkg.bin[binName], {
          ...options,
          external: id => binExternal(id, binName),
          entry: input,
        });

        // We only care about CJS for binaries
        config.output = config.output[0];
        config.output.banner = '#!/usr/bin/env node';
        return config;
      })
    );
  }

  return targets;
};

export default configureDefault;
