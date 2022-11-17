import React, {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  useState,
  useCallback,
  useRef,
} from 'react';

import {Announcer, SROnly, useAnnouncements} from '../a11y-utils';
import {useUniqueId} from '../unique-id';

import KeyboardMap from './keymap';
import DefaultMessages from './messages';
import {Messages} from './types';
import * as S from './styles';

const normalizeTag = (tag: string) => tag.replace(/\s+/g, ' ').trim();

export type Props = {
  className?: string;
  tags: string[];
  minimal?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  messages?: Messages;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  onChange: (tags: string[]) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

const TagInput = React.memo((props: Props): JSX.Element => {
  const {
    className,
    tags,
    minimal,
    readOnly = false,
    disabled = false,
    messages = DefaultMessages,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    onChange,
  } = props;

  const outerRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tagRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [hasFocus, setHasFocus] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const ignoreNextFocus = useRef(false);

  const [index, setIndex] = useState(-1);

  const announcements = useAnnouncements();

  const handleFocus = useCallback((e: FocusEvent) => {
    let nextIndex;
    if (e.target === inputRef.current) {
      setInputFocused(true);
      nextIndex = -1;
    } else {
      nextIndex = tagRefs.current.indexOf(e.target as HTMLButtonElement);
    }
    setHasFocus(true);

    if (!ignoreNextFocus.current) {
      setIndex(nextIndex);
    } else {
      ignoreNextFocus.current = false;
    }
  }, []);

  const handleBlur = useCallback((e: FocusEvent) => {
    const outer = outerRef.current;
    // relatedTarget is the element that *gained* focus. If that's outside
    // the outer container, we have lost focus for sure.
    if (outer && !outer.contains(e.relatedTarget as Node | null)) {
      setIndex(-1);
      setHasFocus(false);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const input = inputRef.current!;
      const newTag = normalizeTag(input.value);
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag]);
        announcements.announce(messages.tagAdded(newTag));
      }
      input.value = '';
    }

    if (e.target === inputRef.current) {
      // The input is the element that *lost* focus.
      setInputFocused(false);
    }
  }, [index, tags, onChange]);

  const handleMainMouseUp = useCallback((e: MouseEvent) => {
    if (e.target === outerRef.current) {
      inputRef.current?.focus();
    }
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    const cmd = KeyboardMap.get(e);
    if (cmd) {
      cmd.exec(e, {
        tags,
        index,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        input: inputRef.current!,

        messages,
        announce: announcements.announce,

        setIndex(nextIndex, focus) {
          if (nextIndex !== index) {
            setIndex(nextIndex);
          }
          if (nextIndex !== index || focus !== undefined) {
            // If we're manually shifting the focus, ignore the next focus
            // event so we don't mess things up internally.
            ignoreNextFocus.current = true;

            const focusIndex = focus ?? nextIndex;
            if (focusIndex === -1) {
              inputRef.current?.focus();
            } else {
              tagRefs.current[focusIndex]?.focus();
            }
          }
        },
        setTags: onChange,
      });
    }
  };

  const handleClickTag = (index: number) => {
    inputRef.current?.focus();
    const tag = tags[index];
    onChange(tags.filter((_, i) => i !== index));
    announcements.announce(messages.tagRemoved(tag));
  };

  const id = useUniqueId();
  const mainDescId = `${id}-desc`;
  const tagDescId = `${id}-tagdesc`;

  // Reset before render so all refs are fresh
  tagRefs.current = [];

  return (
    <S.Main
      className={className}
      $minimal={minimal}
      $disabled={disabled}
      aria-roledescription={messages.componentName()}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={
        ariaDescribedby
          ? `${ariaDescribedby} ${mainDescId}`
          : mainDescId
      }
      $inputFocused={inputFocused}
      onMouseUp={handleMainMouseUp}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      ref={outerRef}
    >
      <SROnly id={mainDescId}>
        {messages.currentTags(tags)} {messages.usageHelper()}
      </SROnly>
      <SROnly id={tagDescId}>
        {index !== -1
          ? messages.tagPosition(index + 1, tags.length)
          : ''}
      </SROnly>
      <Announcer controller={announcements} silent={!hasFocus}/>
      {tags.map((tag, i) =>
        <S.Tag
          key={tag}
          disabled={disabled}
          aria-describedby={tagDescId}
          onClick={() => handleClickTag(i)}
          ref={e => { tagRefs.current[i] = e; }}
        >
          {tag}
          {!disabled && <S.DeleteMarker/>}
        </S.Tag>
      )}
      <S.Input
        aria-label={messages.inputLabel()}
        readOnly={readOnly}
        disabled={disabled}
        ref={inputRef}
      />
    </S.Main>
  );
});

TagInput.displayName = 'TagInput';

export default TagInput;
