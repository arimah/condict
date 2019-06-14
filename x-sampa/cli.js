/* eslint-disable no-console */
const readline = require('readline');
const {performance} = require('perf_hooks');

const chalk = require('chalk');
const {yellow, cyan} = chalk;

const xsampa = require('./lib');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const main = () => {
  console.log(yellow('Type some X-SAMPA input to convert it to IPA!'));

  const readNextLine = () => {
    rl.question('X-SAMPA: ', input => {
      if (!input) {
        return rl.close();
      }

      const start = performance.now();
      const ipa = xsampa.default(input);
      const convertTime = (performance.now() - start).toPrecision(3);
      console.log(`${cyan('IPA:')} ${ipa}`);
      console.log(yellow(`(Converted in ${convertTime} ms)`));

      readNextLine();
    });
  };
  readNextLine();
};
main();
