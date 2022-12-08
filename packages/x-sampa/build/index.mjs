/* eslint-disable no-console */
import fs from 'fs';
import url from 'url';
import path from 'path';

import readData from './read-data.mjs';
import formatData from './format-data.mjs';

const dir = path.dirname(url.fileURLToPath(import.meta.url));
const DataDir = path.join(dir, '../data');
const OutputPath = path.join(dir, '../src/data.json');

const mapToObject = map => {
  const object = {};

  map.forEach((value, key) => {
    object[key] = value;
  });

  return object;
};

const main = () => {
  const chars = readData(DataDir);

  const {replacements, charData} = formatData(chars);

  // Have to transform the nice maps into JSON-friendly plain objects.
  const fileData = JSON.stringify({
    replacements: mapToObject(replacements),
    charData: mapToObject(charData),
  });
  fs.writeFileSync(OutputPath, fileData, {
    encoding: 'utf-8',
  });

  console.log(
    `Successfully generated replacement tables for ${replacements.size} inputs.`
  );
};
main();
