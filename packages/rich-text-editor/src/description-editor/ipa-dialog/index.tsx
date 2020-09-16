import React, {
  ChangeEvent,
  MouseEvent,
  KeyboardEvent,
  FormEvent,
  useReducer,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import memoizeOne from 'memoize-one';

import {FocusTrap, Shortcut, useUniqueId} from '@condict/ui';
import {IpaChar, Match, search, getGroups} from '@condict/ipa';

import {PlacementRect} from '../popup';
import Dialog, {
  SearchWrapper,
  SearchInput,
  SubmitButton,
  CloseKey,
  PrevResultKey,
  NextResultKey,
} from '../dialog';

import SearchResultList from './search-result-list';
import CharacterListing from './character-listing';
import * as S from './styles';

export type Props = {
  placement: PlacementRect;
  onEmit: (ipa: string) => void;
  onClose: () => void;
};

const hasQuery = (q: string) => !/^\s*$/.test(q);

const getAllCharCount = memoizeOne((): number =>
  getGroups().reduce((total, group) => {
    if (group.base) {
      total++;
    }
    return total + group.members.length;
  }, 0)
);

const findCharByIndex = (index: number): IpaChar => {
  let offset = 0;
  for (const {base, members} of getGroups()) {
    if (base) {
      if (index === offset) {
        return base;
      }
      offset++;
    }
    if (index - offset < members.length) {
      return members[index - offset];
    }
    offset += members.length;
  }
  // This should never happen.
  throw new Error(`No character at index ${index}`);
};

type State = {
  query: string;
  /** Search results matching the current query. */
  results: readonly Match[] | null;
  /** The currently selected index. */
  index: number;
  /** True if the currently selected result should be scrolled into view. */
  showSelected: boolean;
};

type Message =
  | {type: 'input', value: string}
  | {type: 'clear'}
  | {type: 'prev'}
  | {type: 'next'}
  | {type: 'hover', index: number};

const reduce = (state: State, msg: Message): State => {
  switch (msg.type) {
    case 'input': {
      const {value} = msg;
      const results = hasQuery(value) ? search(value) : null;
      return {
        ...state,
        query: value,
        results,
        // If there is no query, we show a list of all characters, and select
        // the first. Otherwise, if we had results, we select the first one.
        index: !results || results.length > 0 ? 0 : -1,
      };
    }
    case 'clear':
      return {
        ...state,
        query: '',
        results: null,
        // If there was no query previously, there's little reason to reset the
        // index, as the character listing will remain unchanged.
        index: !state.results ? state.index : 0,
      };
    case 'prev': {
      const total = state.results ? state.results.length : getAllCharCount();
      const index = (state.index + total - 1) % total;
      return {...state, index, showSelected: true};
    }
    case 'next': {
      const total = state.results ? state.results.length : getAllCharCount();
      const index = (state.index + 1) % total;
      return {...state, index, showSelected: true};
    }
    case 'hover':
      return {...state, index: msg.index, showSelected: false};
  }
};

const InitialState: State = {
  query: '',
  results: null,
  index: 0,
  showSelected: false,
};

const cancelMouseEvent = (e: MouseEvent) => {
  e.preventDefault();
};

const IpaDialog = (props: Props): JSX.Element => {
  const {placement, onEmit, onClose} = props;

  const id = useUniqueId();

  const [state, dispatch] = useReducer(reduce, InitialState);
  const {query, results, index} = state;

  const mainRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const emit = useCallback((ipa: string) => {
    dispatch({type: 'clear'});
    onEmit(ipa);
    inputRef.current?.focus();
  }, [onEmit]);

  const close = useCallback(() => {
    // HACK: Get around problems with Slate, focus and selection management.
    mainRef.current?.focus();
    window.setTimeout(() => {
      onClose();
    }, 1);
  }, [onClose]);

  const handleInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch({type: 'input', value: e.target.value});
  }, []);

  const handleInputKeyDown = useCallback((e: KeyboardEvent) => {
    if (Shortcut.matches(PrevResultKey, e)) {
      e.preventDefault();
      e.stopPropagation();
      dispatch({type: 'prev'});
    } else if (Shortcut.matches(NextResultKey, e)) {
      e.preventDefault();
      e.stopPropagation();
      dispatch({type: 'next'});
    }
  }, [state]);

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (index !== -1) {
      const char: IpaChar = results
        ? results[index][0]
        : findCharByIndex(index);
      emit(char.input);
    }
  }, [emit, results, index]);

  const handleFormKeyDown = useCallback((e: KeyboardEvent) => {
    if (Shortcut.matches(CloseKey, e)) {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  }, [close]);

  const handleHover = useCallback((index: number) => {
    dispatch({type: 'hover', index});
  }, []);

  const currentResultRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (state.showSelected) {
      currentResultRef.current?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [state]);

  return (
    <FocusTrap
      // COMPAT: We need to call ReactEditor.focus on the editor instead of
      // letting FocusTrap handle it for us. I don't know why.
      return={false}
      onPointerDownOutside={close}
    >
      <Dialog
        aria-label='IPA'
        placement={placement}
        onSubmit={handleSubmit}
        onKeyDown={handleFormKeyDown}
        ref={mainRef}
      >
        <SearchWrapper
          // If results is null, then we show the full character listing, which
          // gives the box some contents.
          aria-expanded={results == null || results.length > 0}
          aria-owns={`${id}-list`}
          aria-haspopup='listbox'
        >
          <SearchInput
            value={query}
            placeholder='f, ng, alveolar sibilant, high tone, ...'
            aria-autocomplete='list'
            aria-controls={`${id}-list`}
            aria-activedescendant={
              index !== -1 ? `${id}-result-${index}` : undefined
            }
            aria-describedby={
              results && results.length === 0 ? `${id}-no-results` : undefined
            }
            onChange={handleInput}
            onKeyDown={handleInputKeyDown}
            ref={inputRef}
          />
          <SubmitButton label='Insert'/>
        </SearchWrapper>
        <S.CharacterList id={`${id}-list`} onMouseDown={cancelMouseEvent}>
          {results ? (
            <SearchResultList
              dialogId={id}
              query={query}
              results={results}
              currentIndex={index}
              currentResultRef={currentResultRef}
              onHover={handleHover}
              onEmit={emit}
            />
          ) : (
            <CharacterListing
              dialogId={id}
              groups={getGroups()}
              currentIndex={index}
              currentResultRef={currentResultRef}
              onHover={handleHover}
              onEmit={emit}
            />
          )}
        </S.CharacterList>
      </Dialog>
    </FocusTrap>
  );
};

export default IpaDialog;
