import {useCallback} from 'react';
import {Editor} from 'slate';
import {useSlate} from 'slate-react';

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

import {
  BlockShortcuts,
  InlineShortcuts,
  LinkShortcuts,
  HelperShortcuts,
} from './shortcuts';

import {
  isBlockActive,
  isInlineActive,
  canIndent,
  canUnindent,
} from './node-utils';
import {SearchIpaIcon} from './icons';
import {MarkType, InlineMessages, BlockMessages, LinkMessages} from './types';

export type Props<S, M> = {
  shortcuts: S;
  messages: M;
};

export const HeadingsGroup = (
  props: Props<BlockShortcuts, BlockMessages>
): JSX.Element => {
  const {shortcuts, messages} = props;
  const editor = useSlate();
  const options = {
    at: editor.selection ?? editor.blurSelection ?? undefined,
  };
  return (
    <Toolbar.Group name={messages.headingsGroup()}>
      <Toolbar.Button
        label={messages.heading1()}
        checked={isBlockActive(editor, 'heading1', options)}
        shortcut={shortcuts.heading1}
        onClick={() => editor.formatBlock('heading1', options)}
      >
        <H1Icon/>
      </Toolbar.Button>
      <Toolbar.Button
        label={messages.heading2()}
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
  props: Props<InlineShortcuts, InlineMessages>
): JSX.Element => {
  const {shortcuts, messages} = props;
  const editor = useSlate();
  const marks = Editor.marks(editor) ?? {};

  const toggleMark = useCallback((key: MarkType) => {
    if (marks[key]) {
      editor.removeMark(key);
    } else {
      editor.addMark(key, true);
    }
  }, [marks]);

  return (
    <Toolbar.Group name={messages.formatGroup()}>
      <Toolbar.Button
        label={messages.bold()}
        checked={marks.bold === true}
        shortcut={shortcuts.bold}
        onClick={() => toggleMark('bold')}
      >
        <BoldIcon/>
      </Toolbar.Button>
      <Toolbar.Button
        label={messages.italic()}
        checked={marks.italic === true}
        shortcut={shortcuts.italic}
        onClick={() => toggleMark('italic')}
      >
        <ItalicIcon/>
      </Toolbar.Button>
      <Toolbar.Button
        label={messages.underline()}
        checked={marks.underline === true}
        shortcut={shortcuts.underline}
        onClick={() => toggleMark('underline')}
      >
        <UnderlineIcon/>
      </Toolbar.Button>
      <Toolbar.Button
        label={messages.strikethrough()}
        checked={marks.strikethrough === true}
        shortcut={shortcuts.strikethrough}
        onClick={() => toggleMark('strikethrough')}
      >
        <StrikethroughIcon/>
      </Toolbar.Button>
      <Toolbar.Button
        label={messages.subscript()}
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
        label={messages.superscript()}
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
  props: Props<LinkShortcuts, LinkMessages> & {
    onSetLink: () => void;
  }
): JSX.Element => {
  const {shortcuts, messages, onSetLink} = props;
  const editor = useSlate();
  const at = editor.selection || editor.blurSelection || undefined;
  const options = {at};
  const hasLink = isInlineActive(editor, 'link', options);
  return (
    <Toolbar.Group name={messages.linkGroup()}>
      <Toolbar.Button
        label={messages.addEditLink()}
        shortcut={shortcuts.addLink}
        checked={hasLink}
        disabled={at === undefined}
        onClick={onSetLink}
      >
        <LinkIcon/>
      </Toolbar.Button>
      <Toolbar.Button
        label={messages.removeLink()}
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
  props: Props<BlockShortcuts, BlockMessages>
): JSX.Element => {
  const {shortcuts, messages} = props;
  const editor = useSlate();
  const options = {
    at: editor.selection ?? editor.blurSelection ?? undefined,
  };
  return <>
    <Toolbar.Group name={messages.listStyleGroup()}>
      <Toolbar.Button
        label={messages.bulletedList()}
        checked={isBlockActive(editor, 'bulletListItem', options)}
        shortcut={shortcuts.bulletList}
        onClick={() => editor.formatBlock('bulletListItem', options)}
      >
        <BulletedListIcon className='rtl-mirror'/>
      </Toolbar.Button>
      <Toolbar.Button
        label={messages.numberedList()}
        checked={isBlockActive(editor, 'numberListItem', options)}
        shortcut={shortcuts.numberList}
        onClick={() => editor.formatBlock('numberListItem', options)}
      >
        <NumberedListIcon/>
      </Toolbar.Button>
    </Toolbar.Group>

    <Toolbar.Group>
      <Toolbar.Button
        label={messages.indent()}
        shortcut={shortcuts.indent}
        disabled={!canIndent(editor, options)}
        onClick={() => editor.indent(options)}
      >
        <IndentMoreIcon className='rtl-mirror'/>
      </Toolbar.Button>
      <Toolbar.Button
        label={messages.unindent()}
        shortcut={shortcuts.unindent}
        disabled={!canUnindent(editor, options)}
        onClick={() => editor.unindent(options)}
      >
        <IndentLessIcon className='rtl-mirror'/>
      </Toolbar.Button>
    </Toolbar.Group>
  </>;
};

export const HelpersGroup = (
  props: Props<HelperShortcuts, BlockMessages> & {
    onOpenIpaDialog: () => void;
  }
): JSX.Element => {
  const {shortcuts, messages, onOpenIpaDialog} = props;
  const editor = useSlate();
  return (
    <Toolbar.Button
      label={messages.insertIpa()}
      disabled={editor.selection === null && editor.blurSelection === null}
      shortcut={shortcuts.insertIpa}
      onClick={onOpenIpaDialog}
    >
      <SearchIpaIcon/>
    </Toolbar.Button>
  );
};
