import React, {
  ReactNode,
  Ref,
  KeyboardEvent,
  MouseEvent,
  FocusEvent,
  useCallback,
  useEffect,
} from 'react';
import {Transforms, Editor} from 'slate';
import {ReactEditor, useSlateStatic} from 'slate-react';

import {renderElement, renderLeaf} from './render';
import * as S from './styles';

const preventFocus = (e: MouseEvent) => {
  e.preventDefault();
};

export type Props = {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  className?: string;
  toolbarItems: ReactNode;
  toolbarAlwaysVisible?: boolean;
  singleLine: boolean;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  onFocusChanged?: (nextFocus: Element | null) => void;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  children?: ReactNode;
};

const BaseEditor = React.forwardRef((
  props: Props,
  ref: Ref<HTMLDivElement>
): JSX.Element => {
  const {
    className,
    toolbarItems,
    toolbarAlwaysVisible = true,
    singleLine,
    onKeyDown,
    onFocusChanged,
    children,
    ...otherProps
  } = props;

  const editor = useSlateStatic();

  const handleMouseDown = useCallback(() => {
    // When the user clicks inside the editor, don't re-select the previous
    // selection. Let the mouse decide where to place the cursor.
    editor.blurSelection = null;
  }, []);

  // COMPAT: Slate does not always invoke the onFocus event, e.g. if the editor
  // is busy updating its selection, which means we need to fall back to native
  // events in order to restore blurSelection correctly.
  useEffect(() => {
    const root = ReactEditor.toDOMNode(editor, editor);

    const handleFocus = () => {
      if (!editor.selection) {
        let selection = editor.blurSelection;
        if (!selection) {
          const start = Editor.start(editor, []);
          selection = {anchor: start, focus: start};
        }
        Transforms.select(editor, selection);
      }
    };
    const handleBlur = () => {
      if (editor.selection) {
        editor.blurSelection = editor.selection;
      }
    };

    root.addEventListener('focus', handleFocus);
    root.addEventListener('blur', handleBlur);

    return () => {
      root.removeEventListener('focus', handleFocus);
      root.removeEventListener('blur', handleBlur);
    };
  }, []);

  // COMPAT: Slate does not appreciate re-renders during focus and blur, so we
  // must execute the focus change handler on the next tick.
  const handleFocusChange = useCallback((e: FocusEvent) => {
    const nextFocus = e.type === 'focus' || e.type === 'focusin'
      ? e.target as Element
      // For blur/focusout, e.relatedTarget is the element that receives focus.
      : e.relatedTarget as Element;
    void Promise.resolve().then(() => {
      onFocusChanged?.(nextFocus);
    });
  }, [onFocusChanged]);

  return (
    <S.EditorContainer
      className={className}
      singleLine={singleLine}
      toolbarAlwaysVisible={toolbarAlwaysVisible}
      onFocus={handleFocusChange}
      onBlur={handleFocusChange}
      ref={ref}
    >
      <S.Toolbar
        alwaysVisible={toolbarAlwaysVisible}
        onMouseDown={preventFocus}
      >
        {toolbarItems}
      </S.Toolbar>

      <S.Editable
        {...otherProps}
        $singleLine={singleLine}
        $toolbarAlwaysVisible={toolbarAlwaysVisible}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onMouseDown={handleMouseDown}
        onKeyDown={onKeyDown}
      />

      {children}
    </S.EditorContainer>
  );
});

BaseEditor.displayName = 'BaseEditor';

export default BaseEditor;
