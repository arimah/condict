import fs from 'fs';

import configure from './rollup.base.js';

const AllPackages = [
  // Build tools
  {
    name: 'graphql-typer',
    options: {
      browser: false,
    },
  },

  // Utilities
  {name: 'inflect'},
  {name: 'ipa'},
  {name: 'x-sampa'},

  // Server
  {
    name: 'server',
    options: {
      browser: false,
    },
  },

  // UI packages
  {name: 'ui'},
  {name: 'rich-text-editor'},
  {name: 'table-editor'},
];

export default args => {
  let packages = AllPackages;

  if (args.configName) {
    const names = args.configName.split(',');
    packages = packages.filter(p => names.includes(p.name));
  }

  return packages.reduce((configs, {name, options}) => {
    const path = `./packages/${name}`;
    const pkg = JSON.parse(fs.readFileSync(`${path}/package.json`));

    return configs.concat(configure(pkg, {
      ...options,
      packagePath: path,
    }));
  }, []);
};
