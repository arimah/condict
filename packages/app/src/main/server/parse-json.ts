import {
  DictionaryEventBatch,
  DictionaryEvent,
  EventAction,
} from '@condict/server';

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value);

export const describeType = (value: any): string =>
  value === null
    ? 'null'
    : Array.isArray(value)
      ? 'array'
      : typeof value;

export const parseEventBatch = (value: unknown): DictionaryEventBatch => {
  if (!isObject(value)) {
    throw new Error(
      `Expected event batch to be an object; got ${describeType(value)}`
    );
  }
  if (value.type !== 'batch') {
    throw new Error(`type: Invalid value: ${String(value)}`);
  }

  const events = value.events;
  if (!Array.isArray(events)) {
    throw new Error(`events: Expected an array; got ${describeType(events)}`);
  }

  return {
    type: 'batch',
    events: events.map(parseEvent),
  };
};

const parseEvent = (value: unknown, index: number): DictionaryEvent => {
  const path = `events.${index}`;

  if (!isObject(value)) {
    throw new Error(
      `${path}: Expected an object; got ${describeType(value)}`
    );
  }
  const action = parseEventAction(value.action, `${path}.action`);
  switch (value.type) {
    case 'language': {
      const id = parseId(value.id, `${path}.id`);
      return {type: 'language', action, id};
    }
    case 'lemma': {
      const id = parseId(value.id, `${path}.id`);
      const languageId = parseId(
        value.languageId,
        `${path}.languageId`
      );
      return {type: 'lemma', action, id, languageId};
    }
    case 'definition': {
      const id = parseId(value.id, `${path}.id`);
      const lemmaId = parseId(value.lemmaId, `${path}.lemmaId`);
      const languageId = parseId(value.languageId, `${path}.languageId`);
      if (action === 'update') {
        const prevLemmaId = parseId(value.prevLemmaId, `${path}.prevLemmaId`);
        return {
          type: 'definition',
          action,
          id,
          lemmaId,
          prevLemmaId,
          languageId,
        };
      }
      return {type: 'definition', action, id, lemmaId, languageId};
    }
    case 'partOfSpeech': {
      const id = parseId(value.id, `${path}.id`);
      const languageId = parseId(value.languageId, `${path}.languageId`);
      return {type: 'partOfSpeech', action, id, languageId};
    }
    case 'inflectionTable': {
      const id = parseId(value.id, `${path}.id`);
      const partOfSpeechId = parseId(
        value.partOfSpeechId,
        `${path}.partOfSpeechId`
      );
      const languageId = parseId(value.languageId, `${path}.languageId`);
      return {type: 'inflectionTable', action, id, partOfSpeechId, languageId};
    }
    case 'tag': {
      const id = parseId(value.id, `${path}.id`);
      return {type: 'tag', action, id};
    }
    default:
      throw new Error(
        `events.${index}.type: Unknown event type: ${String(value.type)}`
      );
  }
};

const parseId = (value: unknown, path: string): number => {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new Error(
      `${path}: Expected an integer number; got ${String(value)}`
    );
  }
  return value;
};

const parseEventAction = (value: unknown, path: string): EventAction => {
  switch (value) {
    case 'create':
    case 'update':
    case 'delete':
      return value;
    default:
      throw new Error(
        `${path}: Invalid value: ${String(value)}`
      );
  }
};
