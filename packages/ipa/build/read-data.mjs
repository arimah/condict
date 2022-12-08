import fs from 'fs';
import path from 'path';

import IpaChar from './ipa-char.mjs';

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

const readSynonyms = (dataDir, file) => {
  const synonyms = readJson(dataDir, file);

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

const readChars = (dataDir, file, synonyms, variables) => {
  const chars = readJson(dataDir, file);
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

export default dataDir => {
  const baseData = readJson(dataDir, 'index.json');

  const synonyms = readSynonyms(dataDir, baseData.synonyms);
  const variables = new Map(Object.entries(baseData.variables));
  const chars = [];
  baseData.characters.forEach(charFile => {
    for (const char of readChars(dataDir, charFile, synonyms, variables)) {
      chars.push(char);
    }
  });

  return chars;
};
