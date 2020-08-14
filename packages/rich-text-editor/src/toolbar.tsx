import React, {useCallback} from 'react';
import {Editor, Range} from 'slate';

import H1Icon from 'mdi-react/FormatHeader1Icon';
import H2Icon from 'mdi-react/FormatHeader2Icon';

import BoldIcon from 'mdi-react/FormatBoldIcon';
import ItalicIcon from 'mdi-react/FormatItalicIcon';
import UnderlineIcon from 'mdi-react/FormatUnderlineIcon';
import StrikethroughIcon from 'mdi-react/FormatStrikethroughIcon';
import SubscriptIcon from 'mdi-react/FormatSubscriptIcon';
import SuperscriptIcon from 'mdi-react/FormatSuperscriptIcon';

import LinkIcon from 'mdi-react/LinkIcon';
import RemoveLinkIcon from 'mdi-react/LinkOffIcon';

import BulletedListIcon from 'mdi-react/FormatListBulletedIcon';
import NumberedListIcon from 'mdi-react/FormatListNumberedIcon';
import IndentMoreIcon from 'mdi-react/FormatIndentIncreaseIcon';
import IndentLessIcon from 'mdi-react/FormatIndentDecreaseIcon';

import {Toolbar} from '@condict/ui';

import {BlockShortcuts, InlineShortcuts, LinkShortcuts} from './shortcuts';

import {useCondictEditor} from './plugin';
import {
  isBlockActive,
  isInlineActive,
  canIndent,
  canUnindent,
} from './node-utils';
import {MarkType} from './types';

export type Props<S> = {
  shortcuts: S;
};

export const HeadingsGroup = (
  {shortcuts}: Props<BlockShortcuts>
): JSX.Element => {
  const editor = useCondictEditor();
  const options = {
    at: editor.selection || editor.blurSelection || undefined,
  };
  return (
    <Toolbar.Group name='Headings'>
      <Toolbar.Button
        label='Heading 1'
        checked={isBlockActive(editor, 'heading1', options)}
        shortcut={shortcuts.heading1}
        onClick={() => editor.formatBlock('heading1', options)}
      >
        <H1Icon/>
      </Toolbar.Button>
      <Toolbar.Button
        label='Heading 2'
        checked={isBlockActive(editor, 'heading2', options)}
        shortcut={shortcuts.heading2}
        onClick={() => editor.formatBlock('heading2', options)}
      >
        <H2Icon/>
      </Toolbar.Button>
    </Toolbar.Group>
  );
};

export const InlineFormatGroup = (
  {shortcuts}: Props<InlineShortcuts>
): JSX.Element => {
  const editor = useCondictEditor();
  const marks = Editor.marks(editor) || {};

  const toggleMark = useCallback((key: MarkType) => {
    if (marks[key]) {
      editor.removeMark(key);
    } else {
      editor.addMark(key, true);
    }
  }, [marks]);

  return (
    <Toolbar.Group name='Format'>
      <Toolbar.Button
        label='Bold'
        checked={marks.bold === true}
        shortcut={shortcuts.bold}
        onClick={() => toggleMark('bold')}
      >
        <BoldIcon/>
      </Toolbar.Button>
      <Toolbar.Button
        label='Italic'
        checked={marks.italic === true}
        shortcut={shortcuts.italic}
        onClick={() => toggleMark('italic')}
      >
        <ItalicIcon/>
      </Toolbar.Button>
      <Toolbar.Button
        label='Underline'
        checked={marks.underline === true}
        shortcut={shortcuts.underline}
        onClick={() => toggleMark('underline')}
      >
        <UnderlineIcon/>
      </Toolbar.Button>
      <Toolbar.Button
        label='Strike through'
        checked={marks.strikethrough === true}
        shortcut={shortcuts.strikethrough}
        onClick={() => toggleMark('strikethrough')}
      >
        <StrikethroughIcon/>
      </Toolbar.Button>
      <Toolbar.Button
        label='Subscript'
        checked={marks.subscript === true}
        shortcut={shortcuts.subscript}
        onClick={() => {
          toggleMark('subscript');
          editor.removeMark('superscript');
        }}
      >
        <SubscriptIcon/>
      </Toolbar.Button>
      <Toolbar.Button
        label='Superscript'
        checked={marks.superscript === true}
        shortcut={shortcuts.superscript}
        onClick={() => {
          toggleMark('superscript');
          editor.removeMark('subscript');
        }}
      >
        <SuperscriptIcon/>
      </Toolbar.Button>
    </Toolbar.Group>
  );
};

export const LinkGroup = (
  {shortcuts, onSetLink}: Props<LinkShortcuts> & {
    onSetLink: () => void;
  }
): JSX.Element => {
  const editor = useCondictEditor();
  const at = editor.selection || editor.blurSelection || undefined;
  const options = {at};
  const hasLink = isInlineActive(editor, 'link', options);
  return (
    <Toolbar.Group name='Link'>
      <Toolbar.Button
        label='Add/edit link'
        shortcut={shortcuts.addLink}
        checked={hasLink}
        disabled={!hasLink && (at === undefined || Range.isCollapsed(at))}
        onClick={onSetLink}
      >
        <LinkIcon/>
      </Toolbar.Button>
      <Toolbar.Button
        label='Remove link'
        shortcut={shortcuts.removeLink}
        disabled={!hasLink}
        onClick={() => editor.removeLink(options)}
      >
        <RemoveLinkIcon/>
      </Toolbar.Button>
    </Toolbar.Group>
  );
};

export const BlockFormatGroup = (
  {shortcuts}: Props<BlockShortcuts>
): JSX.Element => {
  const editor = useCondictEditor();
  const options = {
    at: editor.selection || editor.blurSelection || undefined,
  };
  return <>
    <Toolbar.Group name='List style'>
      <Toolbar.Button
        label='Bulleted list'
        checked={isBlockActive(editor, 'bulletListItem', options)}
        shortcut={shortcuts.bulletList}
        onClick={() => editor.formatBlock('bulletListItem', options)}
      >
        <BulletedListIcon/>
      </Toolbar.Button>
      <Toolbar.Button
        label='Numbered list'
        checked={isBlockActive(editor, 'numberListItem', options)}
        shortcut={shortcuts.numberList}
        onClick={() => editor.formatBlock('numberListItem', options)}
      >
        <NumberedListIcon/>
      </Toolbar.Button>
    </Toolbar.Group>

    <Toolbar.Group>
      <Toolbar.Button
        label='Increase indentation'
        shortcut={shortcuts.indent}
        disabled={!canIndent(editor, options)}
        onClick={() => editor.indent(options)}
      >
        <IndentMoreIcon/>
      </Toolbar.Button>
      <Toolbar.Button
        label='Decrease indentation'
        shortcut={shortcuts.unindent}
        disabled={!canUnindent(editor, options)}
        onClick={() => editor.unindent(options)}
      >
        <IndentLessIcon/>
      </Toolbar.Button>
    </Toolbar.Group>
  </>;
};
