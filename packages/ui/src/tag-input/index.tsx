import React, {
  Component,
  FocusEventHandler,
  FormEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  RefObject,
  useState,
  useEffect,
  useRef,
} from 'react';

import DescendantCollection from '../descendant-collection';
import {Shortcut, ShortcutMap} from '../shortcut';
import {SROnly} from '../a11y-utils';
import genUniqueId from '../unique-id';

import * as S from './styles';

const Separators = /[,;]/;

const normalizeTag = (tag: string) => tag.replace(/\s+/g, ' ').trim();

const uniqueTags = (tags: string[]) => {
  const seenTags = new Set<string>();
  return tags.reduce((result, tag) => {
    const lowerTag = tag.toLowerCase();
    if (seenTags.has(lowerTag)) {
      return result;
    }
    seenTags.add(lowerTag);
    result.push(tag);
    return result;
  }, [] as string[]);
};

const isEmptySelectionAtStart = (input: HTMLInputElement) =>
  input.selectionStart === 0 &&
  input.selectionEnd === 0;

const isEmptySelectionAtEnd = (input: HTMLInputElement) =>
  input.selectionStart === input.value.length &&
  input.selectionEnd === input.value.length;

type KeyCommand = {
  key: Shortcut | null;
  exec: (tagInput: TagInput) => boolean;
};

const KeyboardMap = new ShortcutMap<KeyCommand>(
  [
    {
      key: Shortcut.parse(['Enter', 'Shift+Enter', 'Primary+Enter']),
      exec(tagInput: TagInput) {
        if (tagInput.state.selected.tag === null) {
          tagInput.commitTags(false);
          return true;
        }
        return false;
      },
    },
    {
      key: Shortcut.parse(['Backspace', 'Shift+Backspace', 'Primary+Backspace']),
      exec(tagInput: TagInput) {
        const {selected: {tag}} = tagInput.state;
        const input = tagInput.input.current;
        if (!input) {
          return false;
        }

        if (tag === null) {
          const {tags} = tagInput.props;
          // If you press backspace in an empty text box, the last tag becomes
          // editable inside the textbox, with the cursor placed at the end.
          // In all other cases, the key press becomes a normal edit command.
          if (input.value === '' && tags.length > 0) {
            tagInput.editTag(tags[tags.length - 1]);
            return true;
          }
        } else {
          // Delete the selected tag
          tagInput.deleteTag(tag, (items, current) =>
            tag === tagInput.props.tags[0]
              ? items.getNext(current)
              : items.getPrevious(current)
          );
          return true;
        }
        return false;
      },
    },
    {
      key: Shortcut.parse('F2'),
      exec(tagInput: TagInput) {
        const {selected: {tag}} = tagInput.state;
        if (tag !== null) {
          tagInput.editTag(tag);
          return true;
        }
        return false;
      },
    },
    {
      key: Shortcut.parse(['Delete', 'Shift+Delete', 'Primary+Delete']),
      exec(tagInput: TagInput) {
        const {selected: {tag}} = tagInput.state;
        if (tag !== null) {
          tagInput.deleteTag(tag, (items, current) =>
            items.getNext(current)
          );
          return true;
        }
        return false;
      },
    },
    {
      key: Shortcut.parse('ArrowLeft ArrowUp'),
      exec(tagInput: TagInput) {
        // The up and left arrows only move the selection into the last tag
        // if the text box has an empty selection at the start. Otherwise it
        // will be treated as a normal edit command.
        const {selected} = tagInput.state;
        const input = tagInput.input.current;
        if (selected.tag !== null || input && isEmptySelectionAtStart(input)) {
          tagInput.items.getPrevious(selected).elem.focus();
          return true;
        }
        return false;
      },
    },
    {
      key: Shortcut.parse('ArrowRight ArrowDown'),
      exec(tagInput: TagInput) {
        // The down and right arrows only move selection into the first tag
        // if the text box has an empty selection at the end. Otherwise it
        // will be treated as a normal edit command.
        const {selected} = tagInput.state;
        const input = tagInput.input.current;
        if (selected.tag !== null || input && isEmptySelectionAtEnd(input)) {
          tagInput.items.getNext(selected).elem.focus();
          return true;
        }
        return false;
      },
    },
    {
      key: Shortcut.parse('Home'),
      exec(tagInput: TagInput) {
        const {selected: {tag}} = tagInput.state;
        const input = tagInput.input.current;
        if (tag !== null || input && isEmptySelectionAtStart(input)) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          tagInput.items.getFirst()!.elem.focus();
          return true;
        }
        return false;
      },
    },
    {
      key: Shortcut.parse('End'),
      exec(tagInput: TagInput) {
        const {tags} = tagInput.props;
        const {selected: {tag}} = tagInput.state;
        const input = tagInput.input.current;
        if (tag !== null || input && isEmptySelectionAtEnd(input)) {
          const lastTag = tags[tags.length - 1];
          const nextSelected = tag === lastTag
            ? tagInput.items.getLast()
            : tagInput.items.find(
              r => r.tag === lastTag
            );
          if (nextSelected) {
            nextSelected.elem.focus();
          }
          return true;
        }
        return false;
      },
    },
  ],
  cmd => cmd.key
);

class TagInputChild {
  private elemRef: RefObject<HTMLButtonElement | HTMLInputElement>;
  public tag: string | null;

  public constructor(
    elemRef: RefObject<HTMLButtonElement | HTMLInputElement>,
    tag: string | null
  ) {
    this.elemRef = elemRef;
    this.tag = tag;
  }

  public get elem(): HTMLButtonElement | HTMLInputElement {
    if (this.elemRef.current === null) {
      throw new Error('Element has been unmounted but not removed from DescendantCollection');
    }
    return this.elemRef.current;
  }
}

type Descendants = DescendantCollection<TagInputChild, HTMLButtonElement | HTMLInputElement>;

type TagButtonProps = {
  tag: string;
  disabled: boolean | undefined;
  isSelected: boolean;
  parentItems: Descendants;
  'aria-describedby': string;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

const TagButton = (props: TagButtonProps) => {
  const {
    tag,
    disabled,
    isSelected,
    parentItems,
    'aria-describedby': ariaDescribedBy,
    onClick,
  } = props;

  const elemRef = useRef<HTMLButtonElement>(null);
  const [item] = useState(() => new TagInputChild(elemRef, tag));
  parentItems.register(item);
  useEffect(() => () => parentItems.unregister(item), []);

  return (
    <S.Tag
      disabled={disabled}
      aria-describedby={ariaDescribedBy}
      tabIndex={isSelected ? 0 : -1}
      onClick={onClick}
      ref={elemRef}
    >
      {tag}
      {!disabled && <S.DeleteMarker/>}
    </S.Tag>
  );
};

export type Props = {
  className?: string;
  tags: string[];
  minimal?: boolean;
  disabled?: boolean;
  onChange: (tags: string[]) => void;
  'aria-label'?: string;
  'aria-labelledby'?: string;
};

type State = {
  inputFocused: boolean;
  selected: TagInputChild;
  announcement: {
    key: string;
    text: string;
  };
};

export class TagInput extends Component<Props, State> {
  public static defaultProps: Partial<Props> = {
    tags: [],
    onChange: (): void => { /* no-op */ },
  };

  public input = React.createRef<HTMLInputElement>();
  public items: Descendants = new DescendantCollection<
    TagInputChild,
    HTMLButtonElement | HTMLInputElement
  >(
    ref => ref.elem
  );
  private wrapper = React.createRef<HTMLSpanElement>();
  private mainDescId = genUniqueId();
  private tagDescId = genUniqueId();
  private hasFocus = false;

  public constructor(props: Props) {
    super(props);

    const inputChild = new TagInputChild(this.input, null);
    this.items.register(inputChild);
    this.state = {
      inputFocused: false,
      selected: inputChild,
      announcement: {key: '', text: ''},
    };
  }

  private handleFocus: FocusEventHandler<HTMLButtonElement | HTMLInputElement> = e => {
    this.hasFocus = true;

    const selected = this.items.findManagedRef(e.target);
    if (!selected) {
      return;
    }

    this.setState({
      selected,
      inputFocused: selected.tag === null,
    });
  };

  private handleBlur: FocusEventHandler = e => {
    if (!this.wrapper.current) {
      return;
    }
    // Focus remains inside the component if the related target is inside
    // the outer element.
    this.hasFocus =
      e.relatedTarget !== null &&
      this.wrapper.current.contains(e.relatedTarget as Node);

    // If we still have focus, don't change the component state at all;
    // the focus event on the tag or input box will take care of that.
    // On the other hand, if focus has left the component, we need to set
    // inputFocused to false, as we know that can't be true anymore.
    // Additionally, when the component is left, we commit the current
    // value of the text input.
    if (!this.hasFocus && this.state.inputFocused) {
      this.setState({inputFocused: false});
      this.commitTags(false);
    }
  };

  private handleMouseUp: MouseEventHandler = e => {
    // If the user is attempting to click on the wrapper, and only then,
    // focus the text input. This should ensure the wrapper acts like a
    // label for the text input, without the accessibility problems that
    // come with a `<label>` that contains interactive content (like the
    // current tag list).
    if (e.target === this.wrapper.current && this.input.current) {
      this.input.current.focus();
    }
  };

  private handleKeyDown: KeyboardEventHandler = e => {
    const command = KeyboardMap.get(e);
    if (command && command.exec(this)) {
      e.preventDefault();
    }
  };

  private handleTagClick: MouseEventHandler = e => {
    const child = this.items.findManagedRef(e.target as HTMLButtonElement);
    if (!child || child.tag === null) {
      return;
    }
    this.deleteTag(child.tag, items => items.getLast());
  };

  private handleInput: FormEventHandler = e => {
    const {value} = e.target as HTMLInputElement;

    if (Separators.test(value)) {
      // When the value changes, the last tag name stays in the text box.
      // If you type one of the separator characters at the end, the last
      // tag name will be the empty string, which means the tag just gets
      // converted to a pill button and all is well. If you paste a value
      // like "One, Two, Three", it means "Three" will remain in the text
      // box, which at least means you can edit "Three". And finally, if
      // you type a separator character anywhere other than the end, the
      // text up to the separator will be committed.
      this.commitTags(true);
    }
  };

  public commitTags(keepLast: boolean): void {
    const input = this.input.current;
    if (!input) {
      return;
    }
    const newTags = input.value.split(Separators);

    if (keepLast) {
      const lastTag = newTags.pop() as string;

      // To ensure the cursor doesn't jump about weirdly, offset it by
      // the number of characters that will be removed as a result of
      // adding tags.
      const prevLength = input.value.length;
      const removed = prevLength - lastTag.length;
      const {selectionStart, selectionEnd, selectionDirection} = input;
      input.value = lastTag;
      input.setSelectionRange(
        (selectionStart as number) - removed,
        (selectionEnd as number) - removed,
        selectionDirection || 'none'
      );
    } else {
      input.value = '';
    }

    const prevTags = this.props.tags;
    const nextTags = uniqueTags([
      ...prevTags,
      ...newTags.map(normalizeTag).filter(Boolean),
    ]);
    this.setTags(nextTags);

    const actualNewTags = nextTags.filter(t => !prevTags.includes(t));
    if (actualNewTags.length > 0) {
      this.announce(
        (actualNewTags.length === 1
          ? 'Tag added: '
          : `${actualNewTags.length} tags added: `
        ) +
        actualNewTags.join(', ')
      );
    } else {
      this.announce('No new tags added.');
    }
  }

  public editTag(tag: string): void {
    const {tags} = this.props;
    const input = this.input.current;
    if (!input) {
      return;
    }

    const nextTags = tags.filter(t => t !== tag);

    // If the input contains anything, commit that value (it can be edited
    // again later).
    const newTag = normalizeTag(input.value);
    if (newTag) {
      nextTags.push(newTag);
    }

    input.value = tag;
    input.setSelectionRange(tag.length, tag.length, 'forward');
    input.focus();

    this.setTags(nextTags);
    this.announce(
      `Editing tag: ${tag}. ${newTag ? `Tag added: ${newTag}.` : ''}`
    );
  }

  public deleteTag(
    tag: string,
    getNextSelected: (
      items: Descendants,
      current: TagInputChild
    ) => TagInputChild | null
  ): void {
    const {tags: prevTags} = this.props;
    const nextTags = prevTags.filter(t => t !== tag);

    const {selected} = this.state;
    let nextSelected = getNextSelected(this.items, selected);
    if (!nextSelected) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      nextSelected = this.items.getLast()!;
    }
    nextSelected.elem.focus();

    this.setTags(nextTags);
    this.announce(`Tag removed: ${tag}.`);
  }

  private setTags(tags: string[]) {
    this.props.onChange(tags);
  }

  private announce(text: string) {
    this.setState({
      announcement: {
        key: genUniqueId(),
        text,
      },
    });
  }

  public render(): JSX.Element {
    const {
      className,
      tags,
      minimal,
      disabled,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
    } = this.props;
    const {inputFocused, selected, announcement} = this.state;

    return (
      <S.Main
        className={className}
        minimal={minimal}
        disabled={disabled}
        role='application'
        aria-roledescription='Tag edit'
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={this.mainDescId}
        inputFocused={inputFocused}
        onMouseUp={this.handleMouseUp}
        onKeyDown={this.handleKeyDown}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        ref={this.wrapper}
      >
        <SROnly id={this.mainDescId}>
          {this.getMainDescription()}
        </SROnly>
        <SROnly id={this.tagDescId}>
          {this.getTagDescription()}
        </SROnly>
        <SROnly aria-live={this.hasFocus ? 'polite' : 'off'}>
          <span key={announcement.key}>
            {announcement.text}
          </span>
        </SROnly>
        {tags.map((tag) =>
          <TagButton
            key={tag}
            tag={tag}
            isSelected={tag === selected.tag}
            disabled={disabled}
            aria-describedby={this.tagDescId}
            parentItems={this.items}
            onClick={this.handleTagClick}
          />
        )}
        <S.Input
          aria-label='New tag'
          size={1}
          tabIndex={selected.tag === null ? 0 : -1}
          disabled={disabled}
          onInput={this.handleInput}
          ref={this.input}
        />
      </S.Main>
    );
  }

  private getMainDescription() {
    const {tags} = this.props;
    const {length} = tags;
    const tagDesc =
      length > 0
        ? `${length} tag${length > 1 ? 's' : ''}: ${tags.join(', ')}.`
        : 'No tags.';
    return `${tagDesc} Use arrow keys to navigate tags.`;
  }

  private getTagDescription() {
    const {tags} = this.props;
    const {selected: {tag}} = this.state;
    if (tag !== null) {
      const index = tags.indexOf(tag);
      return `Tag ${index + 1} of ${tags.length}.`;
    }
    return '';
  }
}
