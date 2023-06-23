import {
  ReactNode,
  MouseEvent,
  KeyboardEvent,
  FocusEvent,
  ChangeEvent,
  useReducer,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
} from 'react';
import TypeToSearchIcon from 'mdi-react/ChevronRightIcon';

import {useUniqueId} from '../unique-id';
import {useWritingDirection} from '../writing-direction';

import Suggestion from './suggestion';
import getKeyboardMap from './keymap';
import {Messages, DefaultMessages} from './messages';
import {State, Message} from './types';
import * as S from './styles';

export type Props<T> = {
  mode?: 'multi' | 'single';
  values: readonly T[];
  getKey: (value: T) => string | number;
  getName: (value: T) => string;
  getTag?: (value: T) => string | null | undefined;
  className?: string;
  minimal?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  knownValues?: readonly T[];
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  messages?: Messages;
  onChange: (value: T[]) => void;
  onSearch?: (query: string) => Promise<T[]> | T[];
};

interface DropdownRect {
  x: number;
  y: number;
  width: number;
}

const InitialState: State<any> = {
  focus: false,
  input: '',
  index: -1,
  results: null,
  showSelected: false,
};

function reduce<T>(state: State<T>, msg: Message<T>): State<T> {
  switch (msg.type) {
    case 'focus': {
      const {focus} = msg;
      return {
        ...state,
        focus,
        index: focus === 'value' ? -1 : state.index,
      };
    }
    case 'blur':
      return {...state, focus: false, index: -1};
    case 'input':
      return {
        ...state,
        input: msg.input,
        index: -1,
        // If the input has been cleared or turned to all-whitespace, then
        // clear the search results immediately.
        results: /^\s*$/.test(msg.input) ? null : state.results,
      };
    case 'results':
      return {
        ...state,
        index: -1,
        results: msg.results,
      };
    case 'hoverSuggestion':
      return {
        ...state,
        index: msg.index,
        // Don't move things around under the mouse pointer.
        showSelected: false,
      };
    case 'selectSuggestion':
      return {
        ...state,
        index: msg.index,
        showSelected: true,
      };
  }
}

export function FieldInput<T>(props: Props<T>): JSX.Element {
  const {
    mode = 'multi',
    values,
    getKey,
    getName,
    getTag = getTagDefault,
    className,
    minimal = false,
    readOnly = false,
    disabled = false,
    knownValues,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    messages = DefaultMessages,
    onChange,
    onSearch,
  } = props;

  if (!knownValues && !onSearch) {
    console.warn(
      'FieldInput: You should pass `knownValues`, `onSearch` or both'
    );
  }

  const dir = useWritingDirection();

  const [state, dispatch] = useReducer<typeof reduce<T>>(
    reduce,
    InitialState as State<T>
  );

  const mainRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionListRef = useRef<HTMLUListElement>(null);

  const singleSelect = mode === 'single';
  const canEdit = !readOnly && !disabled;

  const selectedKeys = useMemo(() => new Set(
    values.map(v => getKey(v))
  ), [values]);

  // Currently displayed dropdown contents, which we need here for
  // the 'prevSuggestion' and 'nextSuggestion' messages.
  const suggestions = getSuggestions(state, knownValues, values);

  const selectValue = useCallback((value: T) => {
    if (!canEdit) {
      return;
    }

    // What happens when you click a suggestion depends on the selection mode:
    //
    //   * In multi-select mode: toggles selection of the value
    //   * In single-select mode:
    //     b) If it is the single selected value: deselects it (clearing the
    //        current selection).
    //     c) Otherwise, selects only the clicked value. This happens if there
    //        were multiple selections, too, effectively reducing the selection
    //        to a single value.
    const key = getKey(value);
    let nextValues: T[];
    if (singleSelect) {
      if (selectedKeys.size === 1 && selectedKeys.has(key)) {
        // Deselect the value
        nextValues = [];
      } else {
        // Select only the clicked value
        nextValues = [value];
      }
    } else {
      if (selectedKeys.has(key)) {
        nextValues = values.filter(v => getKey(v) !== key);
      } else {
        nextValues = [...values, value];
      }
    }
    onChange(nextValues);
  }, [singleSelect, selectedKeys, values, canEdit, getKey, onChange]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.target === mainRef.current) {
      e.preventDefault();
      inputRef.current?.focus();
      dispatch({type: 'hoverSuggestion', index: -1});
    } else if (e.target === inputRef.current) {
      dispatch({type: 'hoverSuggestion', index: -1});
    } else if (dropdownRef.current?.contains(e.target as Node | null)) {
      // Prevent mouse-based focus inside the dropdown
      e.preventDefault();
    }
  }, []);

  const keyboardMap = useMemo(() => getKeyboardMap(dir), [dir]);

  const handleKeyDown = (e: KeyboardEvent) => {
    const cmd = keyboardMap.get(e);
    if (cmd) {
      if (!canEdit) {
        e.preventDefault();
        return;
      }

      cmd.exec(e, {
        state,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        main: mainRef.current!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        input: inputRef.current!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        dropdown: dropdownRef.current!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        suggestionList: suggestionListRef.current!,
        suggestionCount: suggestions.length,
        dispatch,
        select: index => selectValue(suggestions[index]),
      });
    }
  };

  const handleFocus = useCallback((e: FocusEvent) => {
    dispatch({
      type: 'focus',
      focus:
        e.target === inputRef.current ||
        e.target === dropdownRef.current
          ? 'input'
          : 'value',
    });
  }, []);

  const handleBlur = useCallback((e: FocusEvent) => {
    // relatedTarget is the element that *gained* focus. If it's still inside
    // the field input, we should not clear the current focus.
    if (!mainRef.current?.contains(e.relatedTarget as Node | null)) {
      dispatch({type: 'blur'});
      dropdownRef.current?.scrollTo(0, 0);
    }
  }, []);

  const handleInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch({type: 'input', input: e.target.value});
  }, []);

  const handleClickSelected = useCallback((index: number) => {
    if (!canEdit) {
      return;
    }

    // Clicking a selected value always removes it, regardless of selection mode
    onChange(values.filter((_v, i) => i !== index));
    inputRef.current?.focus({preventScroll: true});
  }, [values, canEdit, onChange]);

  const handleHoverSuggestion = useCallback((index: number) => {
    dispatch({type: 'hoverSuggestion', index});
  }, []);

  const trimmedSearchQuery = state.input.trim();
  const searchId = useRef(0);
  useEffect(() => {
    const requestId = ++searchId.current;

    if (trimmedSearchQuery === '') {
      // Empty input is handled in the reducer, instantly resets the search
      return;
    }

    const results =
      onSearch ? onSearch(trimmedSearchQuery) :
      knownValues ? searchDefault(trimmedSearchQuery, knownValues, getName) :
      [];

    if (Array.isArray(results)) {
      dispatch({type: 'results', results});
    } else {
      results.then(r => {
        if (requestId === searchId.current) {
          dispatch({type: 'results', results: r});
        }
      }).catch(e => {
        // TODO: Show error?
        console.error('FieldInput: search error:', e);
        dispatch({type: 'results', results: []});
      });
    }
  }, [trimmedSearchQuery, knownValues, onSearch]);

  useEffect(() => {
    // Scroll the current suggestion into view if needed
    if (state.showSelected && state.index !== -1) {
      suggestionListRef.current?.children[state.index].scrollIntoView({
        block: 'nearest',
      });
    }
  }, [state.index]);

  useEffect(() => {
    // Reset the dropdown scroll whenever the suggestions change
    dropdownRef.current?.scrollTo(0, 0);
  }, [suggestions]);

  const showDropdown = !!state.focus;

  useLayoutEffect(() => {
    if (!showDropdown) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const main = mainRef.current!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const dropdown = dropdownRef.current!;

    let active = true;

    const lastPos: DropdownRect = {x: NaN, y: NaN, width: NaN};
    const place = () => {
      if (!active) {
        return;
      }

      placeDropdown(main, dropdown, lastPos);
      window.requestAnimationFrame(place);
    };
    place();

    return () => {
      active = false;
    };
  }, [showDropdown]);

  const id = useUniqueId();

  const hintMessage = getHintMessage(messages, props, state);

  return (
    <S.Main
      className={className}
      $minimal={minimal}
      $disabled={disabled}
      $inputFocused={state.focus === 'input'}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      ref={mainRef}
    >
      {values.map((val, index) =>
        <S.Value
          key={getKey(val)}
          disabled={disabled}
          onClick={() => handleClickSelected(index)}
        >
          {getName(val)}
          {!disabled && <S.DeleteMarker/>}
        </S.Value>
      )}
      <S.InputWrapper>
        <S.Input
          value={state.input}
          readOnly={readOnly}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-describedby={
            hintMessage && ariaDescribedby
              ? `${id}-hint ${ariaDescribedby}`
              : hintMessage
                ? `${id}-hint`
                : ariaDescribedby
          }
          aria-expanded={showDropdown}
          aria-controls={`${id}-list`}
          aria-haspopup='listbox'
          onChange={handleInput}
          ref={inputRef}
        />
      </S.InputWrapper>
      {/* For aria-controls, the suggestion list has to be present in the DOM
        * even when hidden */}
      <S.Dropdown
        $visible={showDropdown}
        aria-activedescendant={`${id}-list`}
        onMouseLeave={() => handleHoverSuggestion(-1)}
        ref={dropdownRef}
      >
        <S.SuggestionList
          id={`${id}-list`}
          aria-activedescendant={
            state.index >= 0
              ? `${id}-${state.index}`
              : undefined
          }
          ref={suggestionListRef}
        >
          {showDropdown && suggestions.map((val, i) => {
            const key = getKey(val);
            return (
              <Suggestion
                key={key}
                index={i}
                value={val}
                selected={selectedKeys.has(key)}
                singleSelect={singleSelect}
                focused={i === state.index}
                getName={getName}
                getTag={getTag}
                parentId={id}
                onClick={selectValue}
                onHover={handleHoverSuggestion}
              />
            );
          })}
        </S.SuggestionList>
        <S.Hint id={`${id}-hint`} $noResults={state.results?.length === 0}>
          {hintMessage}
        </S.Hint>
      </S.Dropdown>
    </S.Main>
  );
}

function getTagDefault<T>(_value: T): string | null | undefined {
  return null;
}

function getSuggestions<T>(
  state: State<T>,
  knownValues: readonly T[] | undefined,
  selectedValues: readonly T[]
): readonly T[] {
  // If there are search/filter results, display those
  if (state.results) {
    // Note: the array may be empty, in which case a message is shown
    return state.results;
  }
  // If there are known values, display all of those
  if (knownValues) {
    return knownValues;
  }
  // Otherwise, fall back to the currently selected values. In this case, the
  // user should be able to type to search.
  return selectedValues;
}

function searchDefault<T>(
  trimmedQuery: string,
  knownValues: readonly T[],
  getName: (value: T) => string
): T[] {
  // Build a regex from the search string, such that:
  //
  //   * White space is trimmed from the start and end (by the caller);
  //   * \b is inserted at the start of the search, effectively matching from
  //     the start of a word;
  //   * White space inside the string becomes \s+, i.e. it matches at least one
  //     space character; and
  //   * Every other character matches literally
  //
  // The resulting regex is case insensitive and Unicode-aware (which may matter
  // for \s in the future).
  const filterRegex = new RegExp(
    '\\b' + trimmedQuery.replace(
      /([.*+?^${}()|[\]\\])|\s+/gu,
      (_m, metaChar) => metaChar ? `\\${metaChar}` : '\\s+'
    ),
    'iu'
  );
  return knownValues.filter(val => filterRegex.test(getName(val)));
}

function getHintMessage<T>(
  messages: Messages,
  props: Props<T>,
  state: State<T>
): ReactNode {
  if (state.results) {
    if (state.results.length > 0) {
      return null;
    }
    return <>
      <S.NoResults>{messages.noResults(state.input.trim())}</S.NoResults>
      <div>{messages.noResultsHelp()}</div>
    </>;
  }
  if (props.onSearch && props.values.length === 0) {
    return <>
      <TypeToSearchIcon className='rtl-mirror'/>
      <span>{messages.typeToSearch()}</span>
    </>;
  }
  if (
    !props.onSearch &&
    (!props.knownValues || props.knownValues.length === 0)
  ) {
    return messages.noValues();
  }
  return null;
}

const placeDropdown = (
  main: HTMLElement,
  dropdown: HTMLElement,
  lastPos: DropdownRect
) => {
  const mainRect = main.getBoundingClientRect();
  const dropdownHeight = dropdown.getBoundingClientRect().height;
  const effectiveDropdownHeight = Math.max(
    dropdownHeight,
    S.DropdownPlacementMinHeight
  );

  const viewportHeight = document.documentElement.clientHeight;
  const fitsAbove = mainRect.top >= effectiveDropdownHeight;
  const fitsBelow = viewportHeight - mainRect.bottom >= effectiveDropdownHeight;

  const x = mainRect.x;
  const width = mainRect.width;
  const y = !fitsBelow && fitsAbove
    ? mainRect.top - dropdownHeight
    : mainRect.bottom;

  if (x !== lastPos.x || y !== lastPos.y || width !== lastPos.width) {
    dropdown.style.left = `${x}px`;
    dropdown.style.top = `${y}px`;
    dropdown.style.width = `${width}px`;

    lastPos.x = x;
    lastPos.y = y;
    lastPos.width = width;
  }
};
