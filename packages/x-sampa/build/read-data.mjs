import fs from 'fs';
import path from 'path';

const readJson = (dataDir, file) => {
  try {
    const text = fs.readFileSync(path.join(dataDir, file), {
      encoding: 'utf-8',
    });
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Error reading '${file}': ${e.message}`);
  }
};

const normalizeChar = char => {
  // Shorthand for a base character with no ascender or descender.
  if (typeof char === 'string') {
    return {
      base: true,
      ipa: char,
    };
  }

  const result = {
    ipa: char.ipa,
  };
  if (char.diacritic) {
    result.diacritic = true;
    if (char.placements) {
      result.placements = Object.entries(char.placements)
        .reduce((placements, [place, ipa]) => {
          placements[place] = {
            ipa,
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

export default dataDir => {
  const data = readJson(dataDir, 'characters.json');

  return new Map(
    Object.entries(data).map(([xsampa, char]) =>
      [xsampa, normalizeChar(char)]
    )
  );
};
