const fs = require('fs');
const path = require('path');

const IpaChar = require('./ipa-char');

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

const readSynonyms = file => {
  const synonyms = readJson(file);

  const synonymMap = new Map();
  for (const [term, termSynonyms] of Object.entries(synonyms)) {
    synonymMap.set(
      term,
      termSynonyms.map(syn => ({
        term: syn.term,
        scoreDelta: syn.scoreDelta || 0,
      }))
    );
  }

  return synonymMap;
};

const replaceVariables = (value, variables) =>
  value.replace(/\{([^{}]+)\}/g, (_, name) => {
    if (!variables.has(name)) {
      throw new Error(`Unknown variable: {${name}}`);
    }
    return variables.get(name);
  });

const normalizeChar = variables => char => {
  const result = {
    name: char.name,
  };

  result.input = replaceVariables(char.input, variables);
  result.display = char.display
    ? replaceVariables(char.display, variables)
    : result.input;
  result.base = char.base
    ? replaceVariables(char.base, variables)
    : null;
  result.group = char.group
    ? replaceVariables(char.group, variables)
    : result.base || result.input;

  result.terms = Object.entries(char.terms || [])
    .map(([term, score]) => [
      replaceVariables(term, variables),
      score,
    ]);
  return result;
};

const addTerm = (terms, term, score) => {
  if (!terms.has(term)) {
    terms.set(term, score);
  }
};

const addSynonyms = (terms, allSynonyms) => {
  const newTerms = new Map(terms);
  for (const [term, score] of terms) {
    const termSynonyms = allSynonyms.get(term);
    if (termSynonyms) {
      termSynonyms.forEach(synonym => {
        addTerm(newTerms, synonym.term, score + synonym.scoreDelta);
      });
    }
  }
  return newTerms;
};

const readChars = (file, synonyms, variables) => {
  const chars = readJson(file);
  return chars
    .map(normalizeChar(variables))
    .map(char => {
      let terms = new Map(char.terms);

      // The input string is added as a perfect-score term.
      addTerm(terms, char.input, 100);

      // The base letter becomes a very high-scoring term.
      if (char.base) {
        addTerm(terms, char.base, 90);
      }

      char.name.split(/\s+/).forEach(word => {
        const term = word.toLowerCase();
        // Add the word itself as a term.
        addTerm(terms, term, 20);
      });

      terms = addSynonyms(terms, synonyms);

      return new IpaChar(
        char.name,
        char.input,
        char.display,
        char.group,
        terms
      );
    });
};

module.exports = () => {
  const baseData = readJson('index.json');

  const synonyms = readSynonyms(baseData.synonyms);
  const variables = new Map(Object.entries(baseData.variables));
  const chars = [];
  baseData.characters.forEach(charFile => {
    for (const char of readChars(charFile, synonyms, variables)) {
      chars.push(char);
    }
  });

  return chars;
};
