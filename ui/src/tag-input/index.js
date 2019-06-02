import React, {Component, useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';

import genId from '@condict/gen-id';
import {SROnly} from '@condict/a11y-utils';

import DescendantCollection from '../descendant-collection';
import {Shortcut, ShortcutMap} from '../command/shortcut';

import * as S from './styles';

const Separators = /[,;]/;

const normalizeTag = tag => tag.replace(/\s+/g, ' ').trim();

const uniqueTags = tags => {
  const seenTags = Object.create(null);
  return tags.reduce((result, tag) => {
    const lowerTag = tag.toLowerCase();
    if (seenTags[lowerTag]) {
      return result;
    }
    seenTags[lowerTag] = true;
    result.push(tag);
    return result;
  }, []);
};

const isEmptySelectionAtStart = input =>
  input.selectionStart === 0 &&
  input.selectionEnd === 0;

const isEmptySelectionAtEnd = input =>
  input.selectionStart === input.value.length &&
  input.selectionEnd === input.value.length;

const KeyboardMap = new ShortcutMap(
  [
    {
      key: Shortcut.parse(['Enter', 'Shift+Enter', 'Primary+Enter']),
      exec: tagInput => {
        if (tagInput.state.selected.tag === null) {
          tagInput.commitTags(false);
          return true;
        }
      },
    },
    {
      key: Shortcut.parse(['Backspace', 'Shift+Backspace', 'Primary+Backspace']),
      exec: tagInput => {
        const {selected: {tag}} = tagInput.state;
        const input = tagInput.input.current;
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
      },
    },
    {
      key: Shortcut.parse('F2'),
      exec: tagInput => {
        const {selected: {tag}} = tagInput.state;
        if (tag !== null) {
          tagInput.editTag(tag);
          return true;
        }
      },
    },
    {
      key: Shortcut.parse(['Delete', 'Shift+Delete', 'Primary+Delete']),
      exec: tagInput => {
        const {selected: {tag}} = tagInput.state;
        if (tag !== null) {
          tagInput.deleteTag(tag, (items, current) =>
            items.getNext(current)
          );
          return true;
        }
      },
    },
    {
      key: Shortcut.parse('ArrowLeft ArrowUp'),
      exec: tagInput => {
        // The up and left arrows only move the selection into the last tag
        // if the text box has an empty selection at the start. Otherwise it
        // will be treated as a normal edit command.
        const {selected} = tagInput.state;
        const input = tagInput.input.current;
        if (selected.tag !== null || isEmptySelectionAtStart(input)) {
          tagInput.items.getPrevious(selected).elem.focus();
          return true;
        }
      },
    },
    {
      key: Shortcut.parse('ArrowRight ArrowDown'),
      exec: tagInput => {
        // The down and right arrows only move selection into the first tag
        // if the text box has an empty selection at the end. Otherwise it
        // will be treated as a normal edit command.
        const {selected} = tagInput.state;
        const input = tagInput.input.current;
        if (selected.tag !== null || isEmptySelectionAtEnd(input)) {
          tagInput.items.getNext(selected).elem.focus();
          return true;
        }
      },
    },
    {
      key: Shortcut.parse('Home'),
      exec: tagInput => {
        const {selected: {tag}} = tagInput.state;
        const input = tagInput.input.current;
        if (tag !== null || isEmptySelectionAtStart(input)) {
          tagInput.items.getFirst().elem.focus();
          return true;
        }
      },
    },
    {
      key: Shortcut.parse('End'),
      exec: tagInput => {
        const {tags} = tagInput.props;
        const {selected: {tag}} = tagInput.state;
        const input = tagInput.input.current;
        if (tag !== null || isEmptySelectionAtEnd(input)) {
          const lastTag = tags[tags.length - 1];
          const nextSelected = tag === lastTag
            ? tagInput.items.getLast()
            : tagInput.items.itemRefList.find(
              r => r.tag === lastTag
            );
          nextSelected.elem.focus();
          return true;
        }
      },
    },
  ],
  cmd => cmd.key
);

class TagInputChild {
  constructor(elemRef, tag) {
    this.elemRef = elemRef;
    this.tag = tag;
  }

  get elem() {
    return this.elemRef.current;
  }
}

const TagButton = props => {
  const {
    tag,
    disabled,
    isSelected,
    parentItems,
    'aria-describedby': ariaDescribedBy,
    onClick,
  } = props;

  const elemRef = useRef();
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

TagButton.propTypes = {
  tag: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  parentItems: PropTypes.instanceOf(DescendantCollection).isRequired,
  'aria-describedby': PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export class TagInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputFocused: false,
      selected: {tag: null},
      announcement: {key: '', text: ''},
    };

    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleTagClick = this.handleTagClick.bind(this);
    this.handleInput = this.handleInput.bind(this);

    this.wrapper = React.createRef();
    this.input = React.createRef();
    this.items = new DescendantCollection(ref => ref.elem);
    this.mainDescId = genId();
    this.tagDescId = genId();
    this.hasFocus = false;

    this.items.register(new TagInputChild(this.input, null));
  }

  handleFocus(e) {
    this.hasFocus = true;

    const selected = this.items.findManagedRef(e.target);
    if (!selected) {
      return;
    }

    this.setState({
      selected,
      inputFocused: selected.tag === null,
    });
  }

  handleBlur(e) {
    // Focus remains inside the component if the related target is inside
    // the outer element.
    this.hasFocus =
      e.relatedTarget !== null &&
      this.wrapper.current.contains(e.relatedTarget);

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
  }

  handleMouseUp(e) {
    // If the user is attempting to click on the wrapper, and only then,
    // focus the text input. This should ensure the wrapper acts like a
    // label for the text input, without the accessibility problems that
    // come with a `<label>` that contains interactive content (like the
    // current tag list).
    if (e.target === this.wrapper.current) {
      this.input.current.focus();
    }
  }

  handleKeyDown(e) {
    const command = KeyboardMap.get(e);
    if (command && command.exec(this)) {
      e.preventDefault();
    }
  }

  handleTagClick(e) {
    const child = this.items.findManagedRef(e.target);
    if (!child || child.tag === null) {
      return;
    }
    this.deleteTag(child.tag, items => items.getLast());
  }

  handleInput(e) {
    const {value} = e.target;

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
  }

  commitTags(keepLast) {
    const input = this.input.current;
    const newTags = input.value.split(Separators);

    if (keepLast) {
      const lastTag = newTags.pop();

      // To ensure the cursor doesn't jump about weirdly, offset it by
      // the number of characters that will be removed as a result of
      // adding tags.
      const prevLength = input.value.length;
      const removed = prevLength - lastTag.length;
      const {selectionStart, selectionEnd, selectionDirection} = input;
      input.value = lastTag;
      input.setSelectionRange(
        selectionStart - removed,
        selectionEnd - removed,
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

  editTag(tag) {
    const {tags} = this.props;
    const input = this.input.current;

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

  deleteTag(tag, getNextSelected) {
    const {tags: prevTags} = this.props;
    const nextTags = prevTags.filter(t => t !== tag);

    const {selected} = this.state;
    let nextSelected = getNextSelected(this.items, selected);
    if (!nextSelected) {
      nextSelected = this.items.getLast();
    }
    nextSelected.elem.focus();

    this.setTags(nextTags);
    this.announce(`Tag removed: ${tag}.`);
  }

  setTags(tags) {
    this.props.onChange(tags);
  }

  announce(text) {
    this.setState({
      announcement: {
        key: genId(),
        text,
      },
    });
  }

  render() {
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
        <SROnly
          aria-live={this.hasFocus ? 'polite' : 'off'}
          aria-relevant='additions text'
        >
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

  getMainDescription() {
    const {tags} = this.props;
    const {length} = tags;
    const tagDesc =
      length > 0
        ? `${length} tag${length > 1 ? 's' : ''}: ${tags.join(', ')}.`
        : 'No tags.';
    return `${tagDesc} Use arrow keys to navigate tags.`;
  }

  getTagDescription() {
    const {tags} = this.props;
    const {selected: {tag}} = this.state;
    if (tag !== null) {
      const index = tags.indexOf(tag);
      return `Tag ${index + 1} of ${tags.length}.`;
    }
    return '';
  }
}

TagInput.propTypes = {
  className: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  minimal: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  'aria-label': PropTypes.string,
  'aria-labelledby': PropTypes.string,
};

TagInput.defaultProps = {
  className: '',
  tags: [],
  minimal: false,
  disabled: false,
  onChange: () => { },
  'aria-label': undefined,
  'aria-labelledby': undefined,
};
