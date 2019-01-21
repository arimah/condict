const fs = require('fs');

module.exports = fileName => {
  const configText = fs.readFileSync(fileName, {
    encoding: 'utf-8',
  });
  return JSON.parse(configText);
};
