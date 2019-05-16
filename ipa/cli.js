/* eslint-disable no-console */
const readline = require('readline');
const {performance} = require('perf_hooks');

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

const showResults = (results, full) => {
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

const topResultsCount = 20;

const main = () => {
  console.log(chalk.yellow(
    'Type a query to search for IPA characters.\n\n' +
    'Some special commands are also available:\n' +
    `${chalk.cyan(':more')}  Show all results for previous query\n` +
    `${chalk.cyan(':all')}   Switch between all and top ${topResultsCount} results\n` +
    `${chalk.cyan(':full')}  Switch between compact and full result format\n` +
    `${chalk.cyan(':list')}  List all available IPA characters\n`
  ));

  let lastResults = null;
  let full = false;
  let showAll = false;
  let moreUseCount = 0;

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
          lastResults = null;
          break;
        case ':list':
          printAll();
          lastResults = null;
          break;
        case ':all':
          showAll = !showAll;
          console.log(chalk.yellow(
            showAll
              ? 'Showing all results'
              : `Showing top ${topResultsCount} results`
          ));
          break;
        case ':more':
          moreUseCount += 1;
          if (!lastResults) {
            console.log(chalk.yellow('No previous result to expand.'));
          } else if (lastResults.length <= topResultsCount) {
            console.log(chalk.yellow('No more results to show.'));
          } else {
            showResults(lastResults, full);
            lastResults = [];
          }
          if (moreUseCount === 5) {
            console.log(chalk.yellow('(Use :all to always show all results)'));
          }
          break;
        default: {
          const queryStart = performance.now();
          lastResults = ipa.search(query);
          const queryTime = (performance.now() - queryStart).toPrecision(3);
          showResults(
            showAll ? lastResults : lastResults.slice(0, topResultsCount),
            full
          );

          const {length: count} = lastResults;
          if (count > topResultsCount && moreUseCount <= 3) {
            console.log(chalk.yellow(
              `(${count} results in ${queryTime} ms - use :more to see all)`
            ));
          } else {
            console.log(chalk.yellow(
              `(${count} result${count === 1 ? '' : 's'} in ${queryTime} ms)`
            ));
          }

          const nanScores = lastResults.filter(
            ([_, score]) => Number.isNaN(score)
          );
          if (nanScores.length > 0) {
            console.warn(chalk.red(
              `Warning: Found ${
                nanScores.length
              } result${nanScores.length > 1 ? 's' : ''} with a score of NaN!`
            ));
            showResults(nanScores, true);
          }
          break;
        }
      }

      readNextLine();
    });
  };
  readNextLine();
};
main();
