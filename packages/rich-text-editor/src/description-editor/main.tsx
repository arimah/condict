import React, {
  KeyboardEvent,
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import {Transforms, Node as SlateNode, Range} from 'slate';
import {Slate, ReactEditor} from 'slate-react';

import {ShortcutMap} from '@condict/ui';

import DefaultShortcuts, {AllShortcuts} from '../shortcuts';
import createEditor from '../plugin';
import {
  HeadingsGroup,
  InlineFormatGroup,
  LinkGroup,
  BlockFormatGroup,
} from '../toolbar';
import {getInlineCommands, getBlockCommands, getLinkCommands} from '../keymap';
import {isLink, firstMatchingNode} from '../node-utils';
import {LinkTarget} from '../types';

import LinkDialog, {SearchResult, PlacementRect} from './link-dialog';
import * as S from './styles';

export type Props = {
  className?: string;
  value: SlateNode[];
  toolbarAlwaysVisible?: boolean;
  shortcuts?: AllShortcuts;
  onChange: (value: SlateNode[]) => void;
  onFindLinkTarget: (query: string) => Promise<readonly SearchResult[]>;
};

interface LinkProps {
  readonly initialValue: LinkTarget | undefined;
  readonly selection: Range;
  readonly placement: PlacementRect;
}

const DescriptionEditor = (props: Props): JSX.Element => {
  const {
    value,
    shortcuts = DefaultShortcuts,
    onChange,
    onFindLinkTarget,
    ...otherProps
  } = props;

  const [editor] = useState(() => createEditor(false));

  const [linkProps, setLinkProps] = useState<LinkProps | null>(null);
  // If true, call openLinkDialog on the next render.
  const [shouldEditLink, setShouldEditLink] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  const openLinkDialog = useCallback(() => setShouldEditLink(shouldEdit => {
    if (!editor.selection && editor.blurSelection) {
      // We tried last render and it did nothing, so no point trying again.
      if (shouldEdit) {
        return false;
      }

      ReactEditor.focus(editor);
      // Try to open the link dialog again after the next render.
      return true;
    }

    const {selection} = editor;
    const domSelection = window.getSelection();
    if (selection && domSelection && editorRef.current) {
      const nativeRange = domSelection.getRangeAt(0);
      const rect = nativeRange.getBoundingClientRect();
      const editorRect = editorRef.current.getBoundingClientRect();

      const link = firstMatchingNode(editor, {at: selection, match: isLink});
      setLinkProps({
        initialValue: link?.target,
        selection,
        placement: {
          x: rect.x - editorRect.x,
          y: rect.y - editorRect.y,
          width: rect.width,
          height: rect.height,
          parentWidth: editorRect.width,
        },
      });
    }
    // Either no valid selection or dialog is open - don't try again.
    return false;
  }), []);

  const keyboardMap = useMemo(() => new ShortcutMap(
    [
      ...getInlineCommands(shortcuts),
      ...getBlockCommands(shortcuts),
      ...getLinkCommands(shortcuts),
    ],
    cmd => cmd.shortcut
  ), [shortcuts]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const cmd = keyboardMap.get(e);
    if (cmd) {
      e.preventDefault();
      e.stopPropagation();
      cmd.exec(editor, openLinkDialog);
    }
  }, [keyboardMap]);

  useEffect(() => {
    if (shouldEditLink) {
      openLinkDialog();
    }
  }, [shouldEditLink]);

  return (
    <Slate editor={editor} value={value} onChange={onChange}>
      <S.Editor
        {...otherProps}
        singleLine={false}
        toolbarItems={<>
          <HeadingsGroup shortcuts={shortcuts}/>
          <InlineFormatGroup shortcuts={shortcuts}/>
          <LinkGroup shortcuts={shortcuts} onSetLink={openLinkDialog}/>
          <BlockFormatGroup shortcuts={shortcuts}/>
        </>}
        $linkDialogOpen={linkProps !== null}
        onKeyDown={handleKeyDown}
        ref={editorRef}
      >
        {linkProps &&
          <LinkDialog
            initialValue={linkProps.initialValue}
            placement={linkProps.placement}
            onFindLinkTarget={onFindLinkTarget}
            onSubmit={target => {
              setLinkProps(null);
              // TODO: Get rid of setTimeout
              window.setTimeout(() => {
                Transforms.select(editor, linkProps.selection);
                editor.wrapLink(target);
              }, 1);
            }}
            onCancel={() => {
              setLinkProps(null);
              // TODO: Get rid of setTimeout
              window.setTimeout(() => {
                Transforms.select(editor, linkProps.selection);
              }, 1);
            }}
          />}
      </S.Editor>
    </Slate>
  );
};

export default DescriptionEditor;
