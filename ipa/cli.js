/* eslint-disable no-console */
const readline = require('readline');

const chalk = require('chalk');

const ipa = require('./lib');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const printAll = () => {
  ipa.getGroups().forEach(group => {
    const members = group.members.map(m => m.display).join('  ');
    if (group.base) {
      console.log(`${chalk.green(group.base.display)}  ${members}`);
    } else {
      console.log(members);
    }
  });
};

let full = false;
const showResults = (results) => {
  if (full) {
    console.log(
      results.map(([char, score]) =>
        `${chalk.cyan(score.toPrecision(4))} ${chalk.green(char.display)} ${char.name}`
      ).join('\n')
    );
  } else {
    console.log(results.map(([char]) => char.display).join('  '));
  }
};

let lastResults = null;
const readNextLine = () => {
  rl.question('ipa> ', query => {
    if (!query) {
      return rl.close();
    }

    switch (query) {
      case ':full':
        full = !full;
        console.log(chalk.yellow(
          full ? 'Full result format' : 'Compact result format'
        ));
        break;
      case ':list':
        printAll();
        break;
      case ':all':
      case ':more':
        if (!lastResults) {
          console.log(chalk.yellow('No previous result to expand.'));
        } else if (lastResults.length <= 10) {
          console.log(chalk.yellow('No more results to show.'));
        } else {
          showResults(lastResults);
        }
        break;
      default:
        lastResults = ipa.search(query);
        showResults(lastResults.slice(0, 10));
        break;
    }

    readNextLine();
  });
};
readNextLine();

