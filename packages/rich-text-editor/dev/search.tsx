import React from 'react';

import {SearchResult} from '../src';

interface DictionaryItem {
  readonly url: string;
  readonly name: string;
  readonly type: string;
  readonly description?: string;
}

// A very small, static dictionary.
const DictionaryItems: readonly DictionaryItem[] = [
  {
    url: 'condict://definition/1',
    name: 'amaryllis',
    type: 'definition',
    description: 'The belladonna lily, Amaryllis belladonna, native to South Africa.',
  },
  {
    url: 'condict://definition/2',
    name: 'chrysanthemum',
    type: 'definition',
    description: 'Any of many flowering perennial plants, of the genus Chrysanthemum, native to China, that have showy radiate heads.',
  },
  {
    url: 'condict://definition/3',
    name: 'dahlia',
    type: 'definition',
    description: 'Any plant of the genus Dahlia, tuberous perennial flowering plants native to Mexico.',
  },
  {
    url: 'condict://definition/4',
    name: 'gentian',
    type: 'definition',
    description: 'Any of various herbs of the family Gentianaceae found in temperate and mountainous regions with violet or blue flowers.',
  },
  {
    url: 'condict://definition/5',
    name: 'lily of the valley',
    type: 'definition',
    description: 'A flowering plant, Convallaria majalis, with richly fragrant pendant bells. A bonus URL: https://example.com/lily',
  },
  {
    url: 'condict://definition/6',
    name: 'love-in-a-mist',
    type: 'definition',
    description: 'Nigella damascena, an annual flowering plant of the genus Nigella, the blooms of which are generally blue in colour, though also found in shades of pink, white or pale purple.',
  },
  {
    url: 'condict://definition/7',
    name: 'violet',
    type: 'definition',
    description: 'A plant or flower of the genus Viola, especially the fragrant Viola odorata; (inexact) similar-looking plants and flowers.',
  },
  {
    url: 'condict://part-of-speech/1',
    name: 'Adjective',
    type: 'part of speech',
  },
  {
    url: 'condict://part-of-speech/2',
    name: 'Adverb',
    type: 'part of speech',
  },
  {
    url: 'condict://part-of-speech/3',
    name: 'Conjunction',
    type: 'part of speech',
  },
  {
    url: 'condict://part-of-speech/4',
    name: 'Noun',
    type: 'part of speech',
  },
  {
    url: 'condict://part-of-speech/5',
    name: 'Postposition',
    type: 'part of speech',
  },
  {
    url: 'condict://part-of-speech/6',
    name: 'Verb',
    type: 'part of speech',
  },
  {
    url: 'condict://language/1',
    name: 'Mandarin Chinese',
    type: 'language',
  },
  {
    url: 'condict://language/2',
    name: 'Spanish',
    type: 'language',
  },
  {
    url: 'condict://language/3',
    name: 'English',
    type: 'language',
  },
  {
    url: 'condict://language/4',
    name: 'Hindi',
    type: 'language',
  },
  {
    url: 'condict://language/5',
    name: 'Bengali',
    type: 'language',
  },
];

const match = (data: string, query: string): JSX.Element | null => {
  // The laziest possible search.
  const index = data.toLowerCase().indexOf(query);
  if (index !== -1) {
    const before = data.slice(0, index);
    const match = data.slice(index, index + query.length);
    const after = data.slice(index + query.length);
    return <>{before}<b>{match}</b>{after}</>;
  }
  return null;
};

const searchDictionary = (query: string): Promise<readonly SearchResult[]> => {
  query = query.toLowerCase();

  const results: SearchResult[] = [];

  for (const item of DictionaryItems) {
    const nameMatch = match(item.name, query);
    const descriptionMatch = item.description && match(item.description, query);
    if (nameMatch || descriptionMatch) {
      results.push({
        target: {
          url: item.url,
          name: item.name,
          type: item.type,
        },
        name: nameMatch || item.name,
        snippet: descriptionMatch || item.description,
      });
    }
  }

  return Promise.resolve(results);
};

export default searchDictionary;
