import {useReducer, useCallback, useEffect, useRef} from 'react';
import produce, {Draft} from 'immer';

import {SearchScope, LanguageId} from '../../graphql';
import {ExecuteResult, useExecute} from '../../data';

import searchQuery from './query';
import {SearchResult, SearchResultState} from './types';

type State = Omit<SearchResultState, 'onSelect'>;

type Message =
  | {type: 'loading'}
  | {
    type: 'results';
    query: string;
    data: ExecuteResult<typeof searchQuery>;
  }
  | {type: 'select'; index: number | 'next' | 'prev'};

const InitialState: State = {
  query: '',
  loading: false,
  results: [],
  currentIndex: -1,
  scrollToCurrent: false,
};

const NoResults: ExecuteResult<typeof searchQuery> = {
  data: {
    search: {
      nodes: [],
    },
  },
};

const useSearchState = (
  query: string,
  scopes: SearchScope[],
  languageId: LanguageId | undefined
): SearchResultState => {
  const execute = useExecute();

  const [state, dispatch] = useReducer(reduce, InitialState);

  const trimmedQuery = query.trim();

  const requestId = useRef(0);
  const loadingTimeoutId = useRef<number | undefined>(undefined);

  useEffect(() => {
    const id = ++requestId.current;

    if (loadingTimeoutId.current === undefined) {
      // Add a small delay before showing the loading state, to reduce flicker
      // if the query returns results very quickly (common for local servers).
      loadingTimeoutId.current = window.setTimeout(() => {
        dispatch({type: 'loading'});
      }, 200);
    }

    const query = trimmedQuery;
    // Don't send empty queries to the server - they could never match
    // anything anyway.
    const results = query !== ''
      ? execute(searchQuery, {
        query,
        scopes,
        language: languageId && [languageId],
      })
      : Promise.resolve(NoResults);

    void results.then(data => {
      if (id === requestId.current) {
        window.clearTimeout(loadingTimeoutId.current);
        loadingTimeoutId.current = undefined;

        dispatch({type: 'results', query, data});
      }
    });
  }, [trimmedQuery, scopes, languageId]);

  const onSelect = useCallback((index: number | 'next' | 'prev') => {
    dispatch({type: 'select', index});
  }, []);

  return {...state, onSelect};
};

export default useSearchState;

const reduce = produce<State, [Message]>((state, message) => {
  switch (message.type) {
    case 'loading':
      state.loading = true;
      break;
    case 'results': {
      const {query, data} = message;
      const results = formatSearchResults(data);
      state.loading = false;
      state.query = query;
      state.results = results as Draft<SearchResult[]>;
      state.currentIndex = results.length === 0 ? -1 : 0;
      break;
    }
    case 'select': {
      const {index} = message;

      const resultCount = state.results.length;
      if (resultCount === 0 || state.loading) {
        break;
      }

      const prevIndex = state.currentIndex;
      switch (index) {
        case 'next':
          state.currentIndex = (prevIndex + 1) % resultCount;
          state.scrollToCurrent = true;
          break;
        case 'prev':
          state.currentIndex = (prevIndex - 1 + resultCount) % resultCount;
          state.scrollToCurrent = true;
          break;
        default:
          state.currentIndex = index;
          state.scrollToCurrent = false;
          break;
      }
      break;
    }
  }
});

const formatSearchResults = (
  result: ExecuteResult<typeof searchQuery>
): readonly SearchResult[] => {
  const {data} = result;
  if (!data || !data.search) {
    return [];
  }

  const results: SearchResult[] = [];

  for (const node of data.search.nodes) {
    switch (node.__typename) {
      case 'LemmaSearchResult': {
        const {lemma, termSnippet} = node;
        results.push({
          type: 'lemma',
          id: lemma.id,
          term: lemma.term,
          termSnippet,
          partOfSpeechNames: lemma.definitions.reduce((names, d) => {
            const {name} = d.partOfSpeech;
            if (!names.includes(name)) {
              names.push(name);
            }
            return names;
          }, [] as string[]),
          derivedFrom: lemma.derivedDefinitions.map(dd => ({
            formName: dd.inflectedForm.displayName,
            sourceTerm: dd.derivedFrom.term,
          })),
          language: lemma.language,
        });
        break;
      }
      case 'DefinitionSearchResult': {
        const {definition, descriptionSnippet} = node;
        results.push({
          type: 'definition',
          id: definition.id,
          descriptionSnippet,
          term: definition.term,
          partOfSpeechName: definition.partOfSpeech.name,
          language: definition.language,
        });
        break;
      }
    }
  }

  return results;
};
