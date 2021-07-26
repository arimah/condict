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
  searching: boolean;
  /** Current search results. */
  results: readonly SearchResult[];
  /** Currently selected search result index. */
  index: number;
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
  | {type: 'results', results: readonly SearchResult[]}
  | {type: 'hover', index: number}
  | {type: 'prev'}
  | {type: 'next'}
  | {type: 'showError'};

const initState = (props: Props): State => {
  const {initialValue} = props;
  if (initialValue) {
    return {
      value: initialValue.name || initialValue.url,
      searching: false,
      results: [{
        target: initialValue,
        name: initialValue.name || initialValue.url,
      }],
      index: 0,
      showSelected: false,
      showError: false,
    };
  } else {
    return {
      value: '',
      searching: false,
      results: [],
      index: -1,
      showSelected: false,
      showError: false,
    };
  }
};

const reduce = (state: State, msg: Message): State => {
  switch (msg.type) {
    case 'input': {
      const webResult = getWebResult(msg.value);
      return {
        ...state,
        value: msg.value,
        searching: msg.value !== '',
        index: webResult ? 0 : -1,
        results: webResult ? [webResult] : [],
        showError: false,
      };
    }
    case 'results':  {
      const {value, results: prevResults, index: prevIndex} = state;

      let nextResults = msg.results;
      const webResult = getWebResult(value);
      if (webResult) {
        nextResults = [webResult].concat(nextResults);
      }

      // Retain the previous selection if possible.
      let nextIndex = -1;
      if (prevIndex !== -1) {
        const prevResult = prevResults[prevIndex];
        // Assume same target URL == same resource.
        nextIndex = nextResults.findIndex(r =>
          r.target.url === prevResult.target.url
        );
      }

      if (nextIndex === -1 && nextResults.length > 0) {
        nextIndex = 0;
      }

      return {
        ...state,
        searching: false,
        results: nextResults,
        index: nextIndex,
        showSelected: true,
        // Continue to show the error if there are no results and we showed
        // the error previously.
        showError: nextResults.length === 0 && state.showError,
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
      const {searching, index, results} = state;
      if (searching || results.length === 0) {
        return state;
      }
      return {
        ...state,
        index: (index - 1 + results.length) % results.length,
        showSelected: true,
      };
    }
    case 'next': {
      const {searching, index, results} = state;
      if (searching || results.length === 0) {
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

const getWebResult = (value: string): SearchResult | null => {
  value = value.trimLeft();

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

  const searchRequest = useRef(0);
  const handleInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;

    dispatch({type: 'input', value});
    // Have to invalidate the previous request even if the value is empty.
    searchRequest.current++;

    // Don't search if it's empty or all white space.
    if (!/^\s*$/.test(value)) {
      const requestId = searchRequest.current;
      void onFindLinkTarget(value).then(results => {
        if (searchRequest.current === requestId) {
          dispatch({type: 'results', results});
        }
      });
    }
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
