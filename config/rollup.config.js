import fs from 'fs';

import configure from './rollup.base.js';

const AllPackages = [
  // Build tools
  {
    name: 'graphql-typer',
    options: {
      browser: false,
      binEntries: {
        'condict-graphql-typer': 'src/cli.ts',
      },
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
      binEntries: {
        'condict-server': 'src/cli.ts',
      },
    },
  },

  // UI packages
  {name: 'a11y-utils'},
  {name: 'ui'},
  {name: 'ipa-input'},
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
