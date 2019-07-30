/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const readData = require('./read-data');
const formatData = require('./format-data');

const OutputPath = path.join(__dirname, '../src/data.json');

const mapToObject = map => {
  const object = {};

  map.forEach((value, key) => {
    object[key] = value;
  });

  return object;
};

const main = () => {
  const chars = readData();

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
