import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  useReducer,
  useCallback,
  useRef,
  useEffect,
} from 'react';

import {Shortcut, useUniqueId} from '@condict/ui';

import {LinkTarget} from '../../types';

import {PlacementRect} from '../popup';
import Dialog, {
  SearchWrapper,
  SearchInput,
  SubmitButton,
  CloseKey,
  SubmitKey,
  PrevResultKey,
  NextResultKey,
} from '../dialog';
import {Messages} from '../types';

import SearchResultItem from './search-result';
import {SearchResult} from './types';
import * as S from './styles';

export type Props = {
  initialValue?: LinkTarget;
  placement: PlacementRect;
  messages: Messages;
  onFindLinkTarget: (query: string) => Promise<readonly SearchResult[]>;
  onSubmit: (target: LinkTarget) => void;
  onCancel: () => void;
};

type State = {
  /** Typed input value. */
  value: string;
  /** True if the dictionary is currently being searched. */
  loading: boolean;
  /** Currently selected search result index. */
  index: number;
  /** Current search results. */
  results: readonly SearchResult[];
  /** Search results from the previous call to `onFindLinkTarget`. */
  prevResults: readonly SearchResult[];
  /** True if the currently selected result should be scrolled into view. */
  showSelected: boolean;
  /**
   * True if the user has tried to submit the dialog without a valid selection
   * and we should show an error. The error is hidden when the user types.
   */
  showError: boolean;
};

type Message =
  | {type: 'input', value: string}
  | {type: 'loading'}
  | {type: 'results', results: readonly SearchResult[]}
  | {type: 'hover', index: number}
  | {type: 'prev'}
  | {type: 'next'}
  | {type: 'showError'};

const cancelMouseEvent = (e: MouseEvent) => {
  e.preventDefault();
};

const LinkDialog = (props: Props): JSX.Element => {
  const {placement, messages, onFindLinkTarget, onSubmit, onCancel} = props;

  const id = useUniqueId();

  const [state, dispatch] = useReducer(reduce, props, initState);

  const mainRef = useRef<HTMLDivElement>(null);
  const cancel = useCallback(() => {
    // HACK: Get around problems with Slate, focus and selection management.
    void Promise.resolve().then(onCancel);
  }, [onCancel]);

  const submit = useCallback(() => {
    if (state.index === -1) {
      dispatch({type: 'showError'});
    } else {
      // HACK: Going directly from input to Slate causes selection problems.
      mainRef.current?.focus();
      onSubmit(state.results[state.index].target);
    }
  }, [onSubmit, state]);

  const handleInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch({type: 'input', value: e.target.value});
  }, [onFindLinkTarget]);

  const handleInputKeyDown = useCallback((e: KeyboardEvent) => {
    if (Shortcut.matches(SubmitKey, e)) {
      e.preventDefault();
      e.stopPropagation();
      submit();
    } else if (Shortcut.matches(PrevResultKey, e)) {
      e.preventDefault();
      e.stopPropagation();
      dispatch({type: 'prev'});
    } else if (Shortcut.matches(NextResultKey, e)) {
      e.preventDefault();
      e.stopPropagation();
      dispatch({type: 'next'});
    }
  }, [submit]);

  const handleHoverResult = useCallback((index: number) => {
    dispatch({type: 'hover', index});
  }, []);

  const handleDialogKeyDown = useCallback((e: KeyboardEvent) => {
    if (Shortcut.matches(CloseKey, e)) {
      e.preventDefault();
      e.stopPropagation();
      cancel();
    }
  }, [cancel]);

  const requestId = useRef(0);
  const loadingTimeoutId = useRef<number | undefined>(undefined);

  const trimmedQuery = state.value.trim();
  const firstRender = useRef(true);
  useEffect(() => {
    // Don't search when the dialog first opens, only once the user starts
    // typing. Otherwise we might overwrite the initial target with something
    // totally different.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const id = ++requestId.current;

    if (loadingTimeoutId.current === undefined) {
      // Add a small delay before showing the loading state, to reduce flicker
      // if the query returns results very quickly (common for local servers).
      loadingTimeoutId.current = window.setTimeout(() => {
        dispatch({type: 'loading'});
      }, 200);
    }

    // Don't search if it's empty or all white space.
    const request = trimmedQuery !== ''
      ? onFindLinkTarget(trimmedQuery)
      : Promise.resolve([]);

    void request.then(results => {
      if (id === requestId.current) {
        window.clearTimeout(loadingTimeoutId.current);
        loadingTimeoutId.current = undefined;

        dispatch({type: 'results', results});
      }
    });
  }, [trimmedQuery, onFindLinkTarget]);

  const currentResultRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (state.showSelected) {
      currentResultRef.current?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [state]);

  const hasError = state.showError && state.index === -1;

  return (
    <Dialog
      placement={placement}
      aria-label={messages.linkDialogTitle()}
      onKeyDown={handleDialogKeyDown}
      onPointerDownOutside={cancel}
      ref={mainRef}
    >
      <SearchWrapper
        aria-expanded={state.results.length > 0}
        aria-owns={`${id}-results`}
        aria-haspopup='listbox'
      >
        <SearchInput
          placeholder={messages.linkDialogPlaceholder()}
          value={state.value}
          aria-autocomplete='list'
          aria-controls={`${id}-results`}
          aria-activedescendant={
            state.index !== -1
              ? `${id}-result-${state.index}`
              : undefined
          }
          aria-describedby={hasError ? `${id}-error` : undefined}
          onChange={handleInput}
          onKeyDown={handleInputKeyDown}
        />
        {state.loading && <S.Spinner/>}
        <SubmitButton label={messages.linkDialogSave()} onClick={submit}/>
      </SearchWrapper>

      {hasError &&
        <S.Error id={`${id}-error`}>
          {messages.linkDialogError()}
        </S.Error>}

      <S.SearchResultList
        id={`${id}-results`}
        hasResults={state.results.length > 0}
        onMouseDown={cancelMouseEvent}
      >
        {state.results.map((result, index) =>
          <SearchResultItem
            key={index}
            id={`${id}-result-${index}`}
            index={index}
            result={result}
            selected={index === state.index}
            aria-selected={index === state.index}
            onMouseEnter={handleHoverResult}
            onClick={onSubmit}
            ref={index === state.index ? currentResultRef : undefined}
          />
        )}
      </S.SearchResultList>
    </Dialog>
  );
};

export default LinkDialog;

const initState = (props: Props): State => {
  const {initialValue} = props;
  if (initialValue) {
    const results = [{
      target: initialValue,
      name: initialValue.name ?? initialValue.url,
    }];
    return {
      value: initialValue.name ?? initialValue.url,
      loading: false,
      index: 0,
      results,
      prevResults: results,
      showSelected: false,
      showError: false,
    };
  } else {
    return {
      value: '',
      loading: false,
      index: -1,
      results: [],
      prevResults: [],
      showSelected: false,
      showError: false,
    };
  }
};

const reduce = (state: State, msg: Message): State => {
  switch (msg.type) {
    case 'input': {
      const results = getAllResults(msg.value, state.prevResults);
      return {
        ...state,
        value: msg.value,
        index: results.length > 0 ? 0 : -1,
        results,
        showError: false,
      };
    }
    case 'loading':
      return {...state, loading: true};
    case 'results':  {
      const results = getAllResults(state.value, msg.results);
      return {
        ...state,
        loading: false,
        index: results.length > 0 ? 0 : -1,
        results,
        prevResults: msg.results,
        showSelected: true,
        // Continue to show the error if there are no results and we showed
        // the error previously.
        showError: results.length === 0 && state.showError,
      };
    }
    case 'hover':
      return {
        ...state,
        index: msg.index,
        // Don't move things around under the mouse pointer.
        showSelected: false,
      };
    case 'prev': {
      const {index, results} = state;
      if (results.length === 0) {
        return state;
      }
      return {
        ...state,
        index: (index - 1 + results.length) % results.length,
        showSelected: true,
      };
    }
    case 'next': {
      const {index, results} = state;
      if (results.length === 0) {
        return state;
      }
      return {
        ...state,
        index: (index + 1) % results.length,
        showSelected: true,
      };
    }
    case 'showError':
      return {...state, showError: true};
  }
};

const MaybeUrlPattern = /^[a-z0-9-_]+(?:\.[a-z0-9-_]+)+\.?(?:$|[/:?#])/i;
const ValidProtocolPattern = /^https?:$/;

const getAllResults = (
  value: string,
  results: readonly SearchResult[]
): readonly SearchResult[] => {
  const webResult = getWebResult(value);
  if (webResult) {
    return [webResult].concat(results);
  }
  return results;
};

const getWebResult = (value: string): SearchResult | null => {
  value = value.trimStart();

  // If it looks vaguely like a URL that doesn't start with a protocol,
  // automatically prepend 'http://'.
  if (MaybeUrlPattern.test(value)) {
    value = `http://${value}`;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch (e) {
    return null;
  }

  if (
    !ValidProtocolPattern.test(url.protocol) ||
    url.username ||
    url.password
  ) {
    return null;
  }

  const urlText = url.toString();
  return {
    target: {
      url: urlText,
      type: 'web address',
    },
    name: urlText,
  };
};
