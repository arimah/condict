/* eslint-disable no-console */
import fs from 'fs';
import url from 'url';
import path from 'path';

import readData from './read-data.mjs';
import buildSearchTree from './search-tree.mjs';
import buildGroups from './groups.mjs';
import formatChars from './format-chars.mjs';

const dir = path.dirname(url.fileURLToPath(import.meta.url));
const DataDir = path.join(dir, '../data');
const OutputPath = path.join(dir, '../src/data.json');

const main = () => {
  const chars = readData(DataDir);
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
