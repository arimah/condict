import React, {
  Component,
  FocusEventHandler,
  FormEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
} from 'react';

import {Descendants, compareNodes} from '../descendants';
import {Announcer, Announcements, SROnly} from '../a11y-utils';
import genUniqueId from '../unique-id';

import KeyboardMap from './keymap';
import TagButton from './tag-button';
import DefaultMessages from './messages';
import {TagInputChild, Messages} from './types';
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

export type Props = {
  className?: string;
  tags: string[];
  minimal?: boolean;
  disabled?: boolean;
  messages: Messages;
  onChange: (tags: string[]) => void;
  'aria-label'?: string;
  'aria-labelledby'?: string;
};

type State = {
  inputFocused: boolean;
  selected: TagInputChild;
};

export default class TagInput extends Component<Props, State> {
  public static defaultProps: Partial<Props> = {
    tags: [],
    onChange: (): void => { /* no-op */ },
    messages: DefaultMessages,
  };

  public input = React.createRef<HTMLInputElement>();
  public items = Descendants.create<TagInputChild>(
    (a, b) => compareNodes(a.elem, b.elem)
  );
  private wrapper = React.createRef<HTMLSpanElement>();
  private mainDescId = genUniqueId();
  private tagDescId = genUniqueId();
  private announcements = Announcements.create();
  private hasFocus = false;

  public constructor(props: Props) {
    super(props);

    const inputChild = new TagInputChild(this.input, null);
    Descendants.register(this.items, inputChild);
    this.state = {
      inputFocused: false,
      selected: inputChild,
    };
  }

  private handleFocus: FocusEventHandler<HTMLButtonElement | HTMLInputElement> = e => {
    this.hasFocus = true;

    const selected = Descendants.first(
      this.items,
      ({elem}) => elem.contains(e.target)
    );
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
    const child = this.items.items.find(item =>
      item.elem.contains(e.target as Node)
    );
    if (!child || child.tag === null) {
      return;
    }
    this.deleteTag(child.tag, items => Descendants.last(items));
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

    const {tags: prevTags, messages} = this.props;

    const nextTags = uniqueTags([
      ...prevTags,
      ...newTags.map(normalizeTag).filter(Boolean),
    ]);
    this.setTags(nextTags);

    const actualNewTags = nextTags.filter(t => !prevTags.includes(t));
    if (actualNewTags.length > 0) {
      this.announcements.announce(messages.tagsAdded(actualNewTags));
    } else {
      this.announcements.announce(messages.noNewTags());
    }
  }

  public editTag(tag: string): void {
    const {tags, messages} = this.props;
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
    this.announcements.announce(messages.editingTag(tag, newTag));
  }

  public deleteTag(
    tag: string,
    getNextSelected: (
      items: Descendants<TagInputChild>,
      current: TagInputChild
    ) => TagInputChild | null
  ): void {
    const {tags: prevTags, messages} = this.props;
    const nextTags = prevTags.filter(t => t !== tag);

    const {selected} = this.state;
    let nextSelected = getNextSelected(this.items, selected);
    if (!nextSelected) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      nextSelected = Descendants.last(this.items)!;
    }
    nextSelected.elem.focus();

    this.setTags(nextTags);
    this.announcements.announce(messages.tagRemoved(tag));
  }

  private setTags(tags: string[]) {
    this.props.onChange(tags);
  }

  public render(): JSX.Element {
    const {
      className,
      tags,
      minimal,
      disabled,
      messages,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
    } = this.props;
    const {inputFocused, selected} = this.state;

    return (
      <S.Main
        className={className}
        minimal={minimal}
        disabled={disabled}
        role='application'
        aria-roledescription={messages.componentName()}
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
          {messages.currentTags(tags)} {messages.usageHelper()}
        </SROnly>
        <SROnly id={this.tagDescId}>
          {selected.tag !== null
            ? messages.tagPosition(tags.indexOf(selected.tag) + 1, tags.length)
            : ''}
        </SROnly>
        <Announcer controller={this.announcements} silent={!this.hasFocus}/>
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
          aria-label={messages.inputLabel()}
          size={1}
          tabIndex={selected.tag === null ? 0 : -1}
          disabled={disabled}
          onInput={this.handleInput}
          ref={this.input}
        />
      </S.Main>
    );
  }
}
