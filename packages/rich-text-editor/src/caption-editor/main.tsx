import {KeyboardEvent, useState, useMemo, useCallback} from 'react';
import {Descendant} from 'slate';
import {Slate} from 'slate-react';

import {ShortcutMap} from '@condict/ui';

import DefaultShortcuts, {InlineShortcuts} from '../shortcuts';

import {BaseEditable, EditorContainer, EditorToolbar} from '../base-editor';
import createEditor from '../plugin';
import {getInlineCommands, getSingleLineCommands} from '../keymap';
import {DefaultInlineMessages} from '../messages';
import {InlineFormatGroup} from '../toolbar';
import {BlockElement} from '../types';

import {Messages} from './types';

export type Props = {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  className?: string;
  value: BlockElement[];
  toolbarAlwaysVisible?: boolean;
  readOnly?: boolean;
  shortcuts?: InlineShortcuts;
  messages?: Messages;
  onChange: (value: BlockElement[]) => void;
};

type SlateChangeFn = (value: Descendant[]) => void;

const TableCaptionEditor = (props: Props): JSX.Element => {
  const {
    value,
    shortcuts = DefaultShortcuts,
    messages = DefaultInlineMessages,
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    readOnly = false,
    toolbarAlwaysVisible = false,
    onChange,
  } = props;

  const [editor] = useState(() => createEditor(true));

  const keyboardMap = useMemo(() => new ShortcutMap(
    [
      ...getInlineCommands(shortcuts),
      ...getSingleLineCommands(),
    ],
    cmd => cmd.shortcut
  ), [shortcuts]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const cmd = keyboardMap.get(e);
    if (cmd) {
      cmd.exec(e, {editor});
    }
  }, [keyboardMap]);

  return (
    <Slate editor={editor} value={value} onChange={onChange as SlateChangeFn}>
      <EditorContainer
        className={className}
        $singleLine
        $toolbarAlwaysVisible={toolbarAlwaysVisible}
      >
        <EditorToolbar alwaysVisible={toolbarAlwaysVisible}>
          <InlineFormatGroup shortcuts={shortcuts} messages={messages}/>
        </EditorToolbar>

        <BaseEditable
          singleLine
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-describedby={ariaDescribedby}
          readOnly={readOnly}
          toolbarAlwaysVisible={toolbarAlwaysVisible}
          onKeyDown={handleKeyDown}
        />
      </EditorContainer>
    </Slate>
  );
};

export default TableCaptionEditor;
