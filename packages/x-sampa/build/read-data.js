const fs = require('fs');
const path = require('path');

const DataPath = path.join(__dirname, '../data');

const readJson = file => {
  try {
    const text = fs.readFileSync(path.join(DataPath, file), {
      encoding: 'utf-8',
    });
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Error reading '${file}': ${e.message}`);
  }
};

const normalizeChar = (xsampa, char) => {
  // Shorthand for a base character with no ascender or descender.
  if (typeof char === 'string') {
    return {
      base: true,
      ipa: char,
      xsLength: xsampa.length > 1 ? xsampa.length : undefined,
    };
  }

  const result = {
    ipa: char.ipa,
    xsLength: xsampa.length > 1 ? xsampa.length : undefined,
  };
  if (char.diacritic) {
    result.diacritic = true;
    if (char.placements) {
      result.placements = Object.entries(char.placements)
        .reduce((placements, [place, ipa]) => {
          placements[place] = {
            ipa,
            xsLength: result.xsLength,
            modifier: place === 'after' || undefined,
            diacritic: place !== 'after' || undefined,
          };
          return placements;
        }, {});
    }
  } else if (char.modifier) {
    result.modifier = true;
  } else {
    result.base = true;
    result.diacritics = char.diacritics;
  }

  return result;
};

module.exports = () => {
  const data = readJson('characters.json');

  return new Map(
    Object.entries(data).map(([xsampa, char]) =>
      [xsampa, normalizeChar(xsampa, char)]
    )
  );
};
