// This file contains some basic sample data for testing UI with, and will be
// removed as soon as we can read data from the server.

import {IdOf} from './graphql-shared';

export type LanguageId = IdOf<'Language'>;

export interface LanguageData {
  readonly id: LanguageId;
  readonly name: string;
}

export type PartOfSpeechId = IdOf<'PartOfSpeech'>;

export interface PartOfSpeechData {
  readonly id: PartOfSpeechId;
  readonly name: string;
  readonly language: LanguageData;
}

export const Languages: Readonly<Record<number, LanguageData>> = {
  1: {
    id: 1 as LanguageId,
    name: 'Foolang Wan',
  },
  2: {
    id: 2 as LanguageId,
    name: 'langBar Tu',
  },
} as const;

export const PartsOfSpeech: Readonly<Record<number, PartOfSpeechData>> = {
  1: {
    id: 1 as PartOfSpeechId,
    name: 'Noun',
    language: Languages[1],
  },
  2: {
    id: 2 as PartOfSpeechId,
    name: 'Verb',
    language: Languages[1],
  },
  3: {
    id: 3 as PartOfSpeechId,
    name: 'Verb',
    language: Languages[2],
  },
  4: {
    id: 4 as PartOfSpeechId,
    name: 'Adjective',
    language: Languages[2],
  },
  5: {
    id: 5 as PartOfSpeechId,
    name: 'Adverb',
    language: Languages[1],
  },
  6: {
    id: 6 as PartOfSpeechId,
    name: 'Preposition',
    language: Languages[1],
  },
  7: {
    id: 7 as PartOfSpeechId,
    name: 'Noun',
    language: Languages[2],
  },
} as const;
