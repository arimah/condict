import {KeyboardEvent, useState, useMemo, useCallback} from 'react';
import {Descendant} from 'slate';
import {Slate} from 'slate-react';

import {ShortcutMap} from '@condict/ui';

import DefaultShortcuts, {InlineShortcuts} from './shortcuts';

import BaseEditor from './base-editor';
import createEditor from './plugin';
import {getInlineCommands, getSingleLineCommands} from './keymap';
import {InlineFormatGroup} from './toolbar';
import {BlockElement} from './types';

export type Props = {
  className?: string;
  value: BlockElement[];
  toolbarAlwaysVisible?: boolean;
  shortcuts?: InlineShortcuts;
  onChange: (value: BlockElement[]) => void;
};

type SlateChangeFn = (value: Descendant[]) => void;

const TableCaptionEditor = (props: Props): JSX.Element => {
  const {
    value,
    shortcuts = DefaultShortcuts,
    onChange,
    ...otherProps
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
      <BaseEditor
        {...otherProps}
        singleLine={true}
        toolbarItems={<InlineFormatGroup shortcuts={shortcuts}/>}
        onKeyDown={handleKeyDown}
      />
    </Slate>
  );
};

export default TableCaptionEditor;
