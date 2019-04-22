import React, {Component} from 'react';
import PropTypes from 'prop-types';

import genId from '@condict/gen-id';
import {SROnly} from '@condict/a11y-utils';

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

const KeyboardMap = new ShortcutMap(
  [
    {
      key: Shortcut.parse(['Enter', 'Shift+Enter', 'Primary+Enter']),
      exec: tagInput => {
        if (tagInput.state.selectedTag === null) {
          tagInput.commitTags(false);
          return true;
        }
      },
    },
    {
      key: Shortcut.parse(['Backspace', 'Shift+Backspace', 'Primary+Backspace']),
      exec: tagInput => {
        const {selectedTag} = tagInput.state;
        const input = tagInput.input.current;
        if (selectedTag === null) {
          const {tags} = tagInput.props;
          // If you press backspace in an empty text box, the last tag becomes
          // editable inside the textbox, with the cursor placed at the end.
          // In all other cases, the key press becomes a normal edit command.
          if (input.value === '' && tags.length > 0) {
            tagInput.editTag(tags.length - 1);
            return true;
          }
        } else {
          // Delete the selected tag
          tagInput.deleteTag(selectedTag, Math.max(0, selectedTag - 1));
          return true;
        }
      },
    },
    {
      key: Shortcut.parse('F2'),
      exec: tagInput => {
        const {selectedTag} = tagInput.state;
        if (selectedTag !== null) {
          tagInput.editTag(selectedTag);
          return true;
        }
      },
    },
    {
      key: Shortcut.parse(['Delete', 'Shift+Delete', 'Primary+Delete']),
      exec: tagInput => {
        const {selectedTag} = tagInput.state;
        if (selectedTag !== null) {
          tagInput.deleteTag(selectedTag, selectedTag);
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
        const {selectedTag} = tagInput.state;
        const input = tagInput.input.current;
        if (selectedTag !== null || isEmptySelectionAtStart(input)) {
          tagInput.moveSelection(-1);
          return true;
        }
      },
    },
    {
      key: Shortcut.parse('ArrowRight ArrowDown'),
      exec: tagInput => {
        // The down and right arrows only operate specially when a tag is
        // selected. Otherwise, they become normal edit commands inside the
        // text box.
        const {selectedTag} = tagInput.state;
        if (selectedTag !== null) {
          tagInput.moveSelection(1);
          return true;
        }
      },
    },
    {
      key: Shortcut.parse('Home'),
      exec: tagInput => {
        const {selectedTag} = tagInput.state;
        const input = tagInput.input.current;
        if (selectedTag !== null || isEmptySelectionAtStart(input)) {
          tagInput.setSelectedTag(0);
          return true;
        }
      },
    },
    {
      key: Shortcut.parse('End'),
      exec: tagInput => {
        const {tags} = tagInput.props;
        const {selectedTag} = tagInput.state;
        if (selectedTag !== null) {
          tagInput.setSelectedTag(
            selectedTag === tags.length - 1 ? null : tags.length - 1
          );
          return true;
        }
      },
    },
  ],
  cmd => cmd.key
);

export class TagInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputFocused: false,
      selectedTag: null,
    };

    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleTagClick = this.handleTagClick.bind(this);
    this.handleInput = this.handleInput.bind(this);

    this.wrapper = React.createRef();
    this.input = React.createRef();
    this.tagButtons = [];
    this.inputDescId = genId();
    this.tagDescId = genId();
    this.hasFocus = false;
  }

  static getDerivedStateFromProps(props, state) {
    // If the new tags would make the currently selected tag impossible,
    // focus the textbox.
    if (state.selectedTag >= props.tags.length) {
      return {selectedTag: null};
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const nextProps = this.props;
    const {selectedTag} = this.state;

    // If the tags or the selected tag index has changed, we need to move
    // focus to the element that's supposed to have it. It may seem that
    // watching only selectedTag would be enough, but if you delete a tag
    // using [Delete], we emulate text editing behaviour by deleting to
    // the right, in which case the selected index will remain the same.
    if (
      this.hasFocus && (
        prevProps.tags !== nextProps.tags ||
        prevState.selectedTag !== selectedTag
      )
    ) {
      let newElement;
      if (selectedTag === null) {
        newElement = this.input.current;
      } else {
        newElement = this.tagButtons[selectedTag];
      }

      if (document.activeElement !== newElement) {
        newElement.focus();
      }
    }
  }

  captureTag(index, elem) {
    this.tagButtons[index] = elem;
  }

  handleFocus(e) {
    this.hasFocus = true;

    let index =
      e.target === this.input.current
        ? null
        : this.tagButtons.indexOf(e.target);
    if (index === -1) {
      return;
    }

    this.setState({
      selectedTag: index,
      inputFocused: index === null,
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
    const index = this.tagButtons.indexOf(e.target);
    if (index === -1) {
      return;
    }
    this.deleteTag(index, null);
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

    this.setTags(uniqueTags([
      ...this.props.tags,
      ...newTags.map(normalizeTag).filter(Boolean),
    ]));
  }

  editTag(index) {
    const {tags} = this.props;
    const input = this.input.current;

    const nextTags = tags.slice(0);
    const editedTag = nextTags[index];
    nextTags.splice(index, 1);

    // If the input contains anything, commit that value (it can be edited
    // again later).
    const newTag = normalizeTag(input.value);
    if (newTag) {
      nextTags.push(newTag);
    }

    input.value = editedTag;
    input.setSelectionRange(editedTag.length, editedTag.length, 'forward');

    this.setSelectedTag(null);
    this.setTags(nextTags);
  }

  deleteTag(index, nextIndex) {
    const nextTags = this.props.tags.slice(0);
    nextTags.splice(index, 1);

    let nextSelectedTag = nextIndex;
    // If there are no more tags to select, or if the selection would
    // end up past the last remaining tag, select the text input.
    if (nextSelectedTag >= nextTags.length) {
      nextSelectedTag = null;
    }

    this.setSelectedTag(nextSelectedTag);
    this.setTags(nextTags);
  }

  moveSelection(delta) {
    const {tags} = this.props;
    const {selectedTag} = this.state;

    const effectiveSelectedIndex =
      selectedTag === null ? tags.length : selectedTag;
    let nextSelectedTag = Math.max(0, effectiveSelectedIndex + delta);
    if (nextSelectedTag >= tags.length) {
      nextSelectedTag = null;
    }

    this.setSelectedTag(nextSelectedTag);
  }

  setTags(tags) {
    this.props.onChange(tags);
  }

  setSelectedTag(index) {
    this.setState({selectedTag: index});
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
    const {inputFocused, selectedTag} = this.state;

    // Prevent memory leaks in case many tags are added and then removed.
    this.tagButtons = [];

    return (
      <S.Main
        className={className}
        minimal={minimal}
        disabled={disabled}
        inputFocused={inputFocused}
        onMouseUp={this.handleMouseUp}
        onKeyDown={this.handleKeyDown}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        ref={this.wrapper}
      >
        <SROnly id={this.inputDescId}>
          {this.getInputDescription()}
        </SROnly>
        <SROnly id={this.tagDescId}>
          {this.getTagDescription()}
        </SROnly>
        {tags.map((tag, index) =>
          <S.Tag
            key={tag}
            disabled={disabled}
            aria-describedby={this.tagDescId}
            tabIndex={selectedTag === index ? 0 : -1}
            onClick={this.handleTagClick}
            ref={elem => this.captureTag(index, elem)}
          >
            {tag}
            {!disabled && <S.DeleteMarker/>}
          </S.Tag>
        )}
        <S.Input
          disabled={disabled}
          size={1}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={this.inputDescId}
          tabIndex={selectedTag === null ? 0 : -1}
          onInput={this.handleInput}
          ref={this.input}
        />
      </S.Main>
    );
  }

  getInputDescription() {
    const {tags} = this.props;
    const {length} = tags;
    return (
      length > 0
        ? `${length} tag${length > 1 ? 's' : ''}: ${tags.join(', ')}`
        : 'No tags'
    );
  }

  getTagDescription() {
    const {tags} = this.props;
    const {selectedTag} = this.state;
    if (selectedTag !== null) {
      return `Tag ${selectedTag + 1} of ${tags.length}`;
    }
    return 'No tag selected';
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
