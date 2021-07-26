import {
  KeyboardEvent,
  FocusEvent,
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import {Transforms, Editor, Descendant, Range} from 'slate';
import {Slate, ReactEditor} from 'slate-react';

import {ShortcutMap} from '@condict/ui';

import BaseEditor from '../base-editor';
import DefaultShortcuts, {AllShortcuts} from '../shortcuts';
import createEditor from '../plugin';
import {
  HeadingsGroup,
  InlineFormatGroup,
  LinkGroup,
  BlockFormatGroup,
  HelpersGroup,
} from '../toolbar';
import {
  getInlineCommands,
  getBlockCommands,
  getLinkCommands,
  getHelperCommands,
} from '../keymap';
import {isLink, firstMatchingNode} from '../node-utils';
import {BlockElement, LinkTarget} from '../types';

import DefaultMessages from './messages';
import ContextualPopup, {ContextualPopupHandle} from './contextual-popup';
import {PlacementRect} from './popup';
import LinkDialog, {SearchResult} from './link-dialog';
import IpaDialog from './ipa-dialog';
import {Messages} from './types';

export type Props = {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  className?: string;
  value: BlockElement[];
  toolbarAlwaysVisible?: boolean;
  shortcuts?: AllShortcuts;
  messages?: Messages;
  onChange: (value: BlockElement[]) => void;
  onFindLinkTarget: (query: string) => Promise<readonly SearchResult[]>;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
};

type SlateChangeFn = (value: Descendant[]) => void;

type DialogType = 'link' | 'ipa';
type DialogProps = LinkProps | IpaProps;

interface LinkProps {
  readonly type: 'link';
  readonly initialValue: LinkTarget | undefined;
  readonly selection: Range;
  readonly placement: PlacementRect;
}

interface IpaProps {
  readonly type: 'ipa';
  readonly selection: Range;
  readonly placement: PlacementRect;
}

type GetDialogProps<T extends DialogType> = (
  selection: Range,
  domSelection: Selection,
  editorRect: DOMRect
) => Extract<DialogProps, {type: T}>;

const DescriptionEditor = (props: Props): JSX.Element => {
  const {
    value,
    shortcuts = DefaultShortcuts,
    messages = DefaultMessages,
    onChange,
    onFindLinkTarget,
    ...otherProps
  } = props;

  const [editor] = useState(() => createEditor(false));

  const [dialogProps, setDialogProps] = useState<DialogProps | null>(null);
  // If not false, open a dialog on the next render.
  const [
    shouldOpenDialog,
    setShouldOpenDialog,
  ] = useState<DialogType | false>(false);

  const editorRef = useRef<HTMLDivElement>(null);

  const tryOpenDialog = useCallback(<T extends DialogType>(
    type: T,
    getProps: GetDialogProps<T>
  ) => setShouldOpenDialog(shouldOpen => {
    if (!editor.selection && editor.blurSelection) {
      // We tried last render and it did nothing, so no point trying again.
      if (shouldOpen) {
        return false;
      }

      ReactEditor.focus(editor);
      // Try to open the dialog again after the next render.
      return type;
    }

    const {selection} = editor;
    const domSelection = window.getSelection();
    if (selection && domSelection && editorRef.current) {
      setDialogProps(getProps(
        selection,
        domSelection,
        editorRef.current.getBoundingClientRect()
      ));
    }

    // Either no valid selection or dialog is open - don't try again.
    return false;
  }), []);

  const openLinkDialog = useCallback(() => {
    tryOpenDialog('link', (selection, domSelection, editorRect) => {
      const link = firstMatchingNode(editor, {at: selection, match: isLink});

      let rect: DOMRect;
      if (link && Range.isCollapsed(selection)) {
        const anchor = ReactEditor.toDOMNode(editor, link);
        rect = anchor.getBoundingClientRect();
      } else {
        const nativeRange = domSelection.getRangeAt(0);
        rect = nativeRange.getBoundingClientRect();
      }

      return {
        type: 'link',
        initialValue: link?.target,
        selection,
        placement: {
          x: rect.x - editorRect.x,
          y: rect.bottom - editorRect.y,
          parentWidth: editorRect.width,
        },
      };
    });
  }, [tryOpenDialog]);

  const openIpaDialog = useCallback(() => {
    tryOpenDialog('ipa', (selection, domSelection, editorRect) => {
      const nativeRange = domSelection.getRangeAt(0);
      const rect = nativeRange.getBoundingClientRect();

      return {
        type: 'ipa',
        selection,
        placement: {
          x: rect.x - editorRect.x,
          y: rect.bottom - editorRect.y,
          parentWidth: editorRect.width,
        },
      };
    });
  }, [tryOpenDialog]);

  const [showPopup, setShowPopup] = useState(false);

  const popupRef = useRef<ContextualPopupHandle>(null);

  const handleFocusChanged = useCallback((nextFocus: Element | null) => {
    const editorElem = ReactEditor.toDOMNode(editor, editor);
    const focusInEditorOrPopup =
      editorElem.contains(nextFocus) ||
      popupRef.current?.contains(nextFocus) ||
      false;
    setShowPopup(focusInEditorOrPopup);
  }, []);

  const keyboardMap = useMemo(() => new ShortcutMap(
    [
      ...getInlineCommands(shortcuts),
      ...getBlockCommands(shortcuts),
      ...getLinkCommands(shortcuts),
      ...getHelperCommands(shortcuts),
    ],
    cmd => cmd.shortcut
  ), [shortcuts]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const cmd = keyboardMap.get(e);
    if (cmd) {
      cmd.exec(e, {
        editor,
        openLinkDialog,
        openIpaDialog,
        focusPopup: () => {
          popupRef.current?.focus();
        },
      });
    }
  }, [keyboardMap]);

  const handleCloseDialog = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    editor.blurSelection = dialogProps!.selection;
    setDialogProps(null);
    // COMPAT: Condict's FocusTrap sets focus in a way Slate doesn't like, which
    // for some reason causes the blurSelection not to be applied on focus. But
    // calling this function here somehow fixes that.
    ReactEditor.focus(editor);
  }, [dialogProps]);

  useEffect(() => {
    switch (shouldOpenDialog) {
      case 'link':
        openLinkDialog();
        break;
      case 'ipa':
        openIpaDialog();
        break;
    }
  }, [shouldOpenDialog]);

  return (
    <Slate editor={editor} value={value} onChange={onChange as SlateChangeFn}>
      <BaseEditor
        {...otherProps}
        singleLine={false}
        toolbarItems={<>
          <HeadingsGroup shortcuts={shortcuts} messages={messages}/>
          <InlineFormatGroup shortcuts={shortcuts} messages={messages}/>
          <LinkGroup
            shortcuts={shortcuts}
            messages={messages}
            onSetLink={openLinkDialog}
          />
          <BlockFormatGroup shortcuts={shortcuts} messages={messages}/>
          <HelpersGroup
            shortcuts={shortcuts}
            messages={messages}
            onOpenIpaDialog={openIpaDialog}
          />
        </>}
        onKeyDown={handleKeyDown}
        onFocusChanged={handleFocusChanged}
        ref={editorRef}
      >
        {dialogProps && dialogProps.type === 'link' &&
          <LinkDialog
            initialValue={dialogProps.initialValue}
            placement={dialogProps.placement}
            messages={messages}
            onFindLinkTarget={onFindLinkTarget}
            onSubmit={target => {
              const at = dialogProps.selection;
              editor.blurSelection = at;
              editor.wrapLink(target, {at});
              setDialogProps(null);
            }}
            onCancel={handleCloseDialog}
          />}
        {dialogProps && dialogProps.type === 'ipa' &&
          <IpaDialog
            placement={dialogProps.placement}
            messages={messages}
            onEmit={ipa => {
              const selection = Editor.rangeRef(editor, dialogProps.selection, {
                affinity: 'forward',
              });
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              Transforms.insertText(editor, ipa, {at: selection.current!});
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              setDialogProps({...dialogProps, selection: selection.unref()!});
            }}
            onClose={handleCloseDialog}
          />}
        {!dialogProps && showPopup &&
          <ContextualPopup
            editorRef={editorRef}
            messages={messages}
            onOpenLinkDialog={openLinkDialog}
            onOpenIpaDialog={openIpaDialog}
            ref={popupRef}
          />}
      </BaseEditor>
    </Slate>
  );
};

export default DescriptionEditor;
