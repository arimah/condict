/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const readData = require('./read-data');
const buildSearchTree = require('./search-tree');
const buildGroups = require('./groups');
const formatChars = require('./format-chars');

const OutputPath = path.join(__dirname, '../src/data.json');

const main = () => {
  const chars = readData();
  const groups = buildGroups(chars);
  const searchTree = buildSearchTree(chars);

  const fileData = JSON.stringify({
    chars: formatChars(chars),
    groups,
    searchTree,
  });
  fs.writeFileSync(OutputPath, fileData, {
    encoding: 'utf-8',
  });

  console.log(`Successfully built tables for ${chars.length} IPA characters`);
};
main();
