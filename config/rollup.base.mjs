import fs from 'fs';
import path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';

const localDepPattern = /^\.\.?\//;
const mainEntryPattern = /^\.\/index\.[tj]sx?$/;

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
      rootDir: './src',
      noEmitOnError: false,
      outputToFilesystem: true,
      ...declarationDir ? {
        declaration: true,
        outDir: `${packagePath}/${declarationDir}`,
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

export const configureTarget = (pkg, target, options = {}) => {
  const env = process.env.NODE_ENV || 'production';
  const {
    entry,
    browser = true,
    external = getExternal(pkg),
    packagePath = '.',
    declarations = false,
  } = options;

  const input = entry
    ? `${packagePath}/${entry}`
    : fs.existsSync(`${packagePath}/src/index.tsx`)
      ? `${packagePath}/src/index.tsx`
      : `${packagePath}/src/index.ts`;

  const firstTarget = Array.isArray(target) ? target[0] : target;
  const targetPath = `${packagePath}/${firstTarget}`;
  const outputDir = path.dirname(firstTarget);
  const outputName = path.basename(firstTarget);

  return {
    input,
    output: getOutput(target, pkg, packagePath, declarations),
    external,
    plugins: getPlugins({
      env,
      browser,
      declarationDir: declarations && outputDir,
      cacheDir: `${packagePath}/.buildcache/${outputName}`,
      tsBuildInfoFile: `.buildcache/${outputName}.tsbuildinfo`,
      packagePath,
    }),
    onwarn,
  };
};

const getOutput = (output, pkg, packagePath) => {
  if (Array.isArray(output)) {
    return output.map(out => getOutput(out, pkg, packagePath));
  }
  // Target paths arrives without packagePath, so we need to prefix
  const targetPath = `${packagePath}/${output}`;
  return {
    format: getOutputFormat(pkg, targetPath),
    exports: 'auto',
    interop: 'auto',
    generatedCode: 'es2015',
    externalLiveBindings: false,
    sourcemap: false,
    file: targetPath,
  };
};

const getOutputFormat = (pkg, outputName) => {
  if (outputName.endsWith('.mjs')) {
    return 'es';
  }
  if (outputName.endsWith('.cjs')) {
    return 'cjs';
  }
  // Otherwise, outputName ends with .js
  return pkg.type === 'module' ? 'es' : 'cjs';
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

  const output = [pkg.main];
  if (pkg.module) {
    output.push(pkg.module);
  }

  let targets = [
    configureTarget(pkg, output, {
      external,
      declarations: true,
      ...options,
    }),
  ];

  if (pkg.binEntries) {
    const binExternal = (id, binName) => {
      if (isExternalDependency(id) || mainEntryPattern.test(id)) {
        return true;
      }
      if (localDepPattern.test(id)) {
        // Allow the module to be imported. It will be resolved to an absolute
        // path next, which we can check below. The exception is `./index.js`,
        // which is the main entry point of the package: we treat this as an
        // external module always.
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
      // Probably a built-in, like 'fs' or 'path'.
      return true;
    };

    targets = targets.concat(
      Object.entries(pkg.binEntries).map(([binName, input]) => {
        const config = configureTarget(pkg, pkg.bin[binName], {
          ...options,
          external: id => binExternal(id, binName),
          entry: input,
        });

        config.output.banner = '#!/usr/bin/env node';
        return config;
      })
    );
  }

  return targets;
};

export default configureDefault;
