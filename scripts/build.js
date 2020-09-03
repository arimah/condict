const childProcess = require('child_process');

const commandLineArgs = require('command-line-args');
const {white, green, magenta} = require('chalk');

const CliOptions = [
  {name: 'watch', alias: 'w', type: Boolean},
  {
    name: 'name',
    alias: 'n',
    type: val => val.split(','),
  },
  {
    name: 'group',
    alias: 'g',
    type: val => val.split(','),
  },
];

// Groups and packages are arranged in build order. Lerna may choose
// a different order to execute commands in, but Rollup will adhere
// to what we write here.
const AllPackages = [
  // Build tools. These are used in the building of other packages,
  // so obviously must be built first.
  {group: 'build-tools', name: 'graphql-typer'},

  // Various utilities that are shared between server and UI packages.
  {group: 'utils', name: 'inflect'},
  {group: 'utils', name: 'ipa'},
  {group: 'utils', name: 'x-sampa'},

  // Server.
  {group: 'server', name: 'server'},

  // UI packages.
  {group: 'ui', name: 'a11y-utils'},
  {group: 'ui', name: 'ui'},
  {group: 'ui', name: 'ipa-input'},
  {group: 'ui', name: 'rich-text-editor'},
  {group: 'ui', name: 'table-editor'},
];

const LogPrefix = `${white('condict')} ${green('info')} ${magenta('build')}`;

const runCommand = (cmd, args) => {
  const result = childProcess.spawnSync(cmd, args, {
    shell: true,
    stdio: 'inherit',
  });

  switch (result.status) {
    case 0:
      // Process completed successfully.
      return;
    case null:
      // Process terminated due to a signal, such as by ^C.
      process.exit();
      break;
    default:
      // Other error; this process fails too.
      console.log(LogPrefix, `Terminated by error: ${result.status}`);
      process.exit(1);
      break;
  }
};

const main = () => {
  const args = commandLineArgs(CliOptions);

  let packages = AllPackages;
  if (args.name) {
    packages = AllPackages.filter(p => args.name.includes(p.name));
  }
  if (args.group) {
    packages = AllPackages.filter(p => args.group.includes(p.group));
  }

  if (packages.length === 0) {
    console.log(LogPrefix, 'No matching packages; aborting');
    return;
  }

  const packageNames = packages.map(p => p.name);

  console.log(LogPrefix, 'Matching packages:', ...packageNames);

  console.log(LogPrefix, 'Running build command in matching packages');

  const lernaScope = packageNames.length > 1
    ? `@condict/{${packageNames.join(',')}}`
    : `@condict/${packageNames[0]}`;
  runCommand('npm', ['run', 'build:children', '--', '--scope', lernaScope]);

  console.log(LogPrefix, 'Running compile command');

  const rollupArgs = [
    'run',
    'compile',
    '--',
    '--configName',
    packageNames.join(','),
  ];
  if (args.watch) {
    rollupArgs.push('--watch');
  }
  runCommand('npm', rollupArgs);
};
main();
