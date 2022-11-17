import {
  KeyboardEvent,
  useState,
  useMemo,
  useCallback,
  useRef,
  FocusEvent,
} from 'react';
import {Transforms, Editor, Descendant, Range} from 'slate';
import {Slate, ReactEditor} from 'slate-react';

import {ShortcutMap} from '@condict/ui';

import {BaseEditable, EditorContainer, EditorToolbar} from '../base-editor';
import DefaultShortcuts, {AllShortcuts} from '../shortcuts';
import createEditor from '../plugin';
import {
  getInlineCommands,
  getBlockCommands,
  getLinkCommands,
  getHelperCommands,
} from '../keymap';
import {isLink, firstMatchingNode} from '../node-utils';
import {BlockElement, LinkTarget} from '../types';

import DefaultMessages from './messages';
import ToolbarItems from './toolbar-items';
import {PlacementRect} from './popup';
import ContextualPopup, {ContextualPopupHandle} from './contextual-popup';
import LinkDialog, {SearchResult} from './link-dialog';
import IpaDialog from './ipa-dialog';
import {Messages} from './types';

export type Props = {
  value: BlockElement[];
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  className?: string;
  toolbarAlwaysVisible?: boolean;
  readOnly?: boolean;
  shortcuts?: AllShortcuts;
  messages?: Messages;
  onChange: (value: BlockElement[]) => void;
  onFindLinkTarget: (query: string) => Promise<readonly SearchResult[]>;
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
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    readOnly = false,
    toolbarAlwaysVisible = true,
    onChange,
    onFindLinkTarget,
  } = props;

  const [editor] = useState(() => createEditor(false));

  const [dialogProps, setDialogProps] = useState<DialogProps | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);

  const tryOpenDialog = useCallback(<T extends DialogType>(
    getProps: GetDialogProps<T>
  ) => {
    const {selection} = editor;
    const domSelection = window.getSelection();
    if (selection && domSelection && editorRef.current) {
      setDialogProps(getProps(
        selection,
        domSelection,
        editorRef.current.getBoundingClientRect()
      ));
    }
    // Either no valid selection or dialog is open - can't open.
  }, []);

  const openLinkDialog = useCallback(() => {
    tryOpenDialog((selection, domSelection, editorRect) => {
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
    tryOpenDialog((selection, domSelection, editorRect) => {
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

  const handleFocusChange = useCallback((e: FocusEvent) => {
    const nextFocus = e.type === 'focus' || e.type === 'focusin'
      ? e.target
      // e.relatedTarget contains the element that gained focus
      : e.relatedTarget;
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
        focusPopup: () => popupRef.current?.focus(),
      });
    }
  }, [keyboardMap]);

  const handleCloseDialog = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const selection = dialogProps!.selection;

    setDialogProps(null);
    // COMPAT: Condict's FocusTrap sets focus in a way Slate doesn't like, which
    // for some reason causes the new selection not to be applied on focus, so
    // we've turned off automatic focus restoration, and need to do this here.
    setTimeout(() => {
      editor.focusWithSelection(selection);
    }, 5);
  }, [dialogProps]);

  return (
    <Slate editor={editor} value={value} onChange={onChange as SlateChangeFn}>
      <EditorContainer
        className={className}
        $singleLine={false}
        $toolbarAlwaysVisible={toolbarAlwaysVisible}
        onFocus={handleFocusChange}
        onBlur={handleFocusChange}
        ref={editorRef}
      >
        <EditorToolbar alwaysVisible={toolbarAlwaysVisible}>
          <ToolbarItems
            shortcuts={shortcuts}
            messages={messages}
            onOpenLinkDialog={openLinkDialog}
            onOpenIpaDialog={openIpaDialog}
          />
        </EditorToolbar>

        <BaseEditable
          singleLine={false}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-describedby={ariaDescribedby}
          readOnly={readOnly}
          toolbarAlwaysVisible={toolbarAlwaysVisible}
          onKeyDown={handleKeyDown}
        />

        {dialogProps && dialogProps.type === 'link' &&
          <LinkDialog
            initialValue={dialogProps.initialValue}
            placement={dialogProps.placement}
            messages={messages}
            onFindLinkTarget={onFindLinkTarget}
            onSubmit={target => {
              const at = dialogProps.selection;
              const selectionRef = Editor.rangeRef(editor, at, {
                affinity: 'forward',
              });
              editor.wrapLink(target, {at});
              setDialogProps(null);
              setTimeout(() => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                editor.focusWithSelection(selectionRef.unref()!);
              });
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
      </EditorContainer>
    </Slate>
  );
};

export default DescriptionEditor;
