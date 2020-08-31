import React, {
  ReactNode,
  Ref,
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
} from 'react';
import {Transforms} from 'slate';
import {ReactEditor} from 'slate-react';

import {useCondictEditor} from '../plugin';

import {renderElement, renderLeaf} from './render';
import * as S from './styles';

const preventFocus = (e: MouseEvent) => {
  e.preventDefault();
};

export type Props = {
  className?: string;
  toolbarItems: ReactNode;
  toolbarAlwaysVisible?: boolean;
  singleLine: boolean;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  onFocusedChange?: (focused: boolean) => void;
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
    onFocusedChange,
    children,
  } = props;

  const editor = useCondictEditor();

  const handleMouseDown = useCallback(() => {
    // When the user clicks inside the editor, don't re-select the previous
    // selection. Let the mouse decide where to place the cursor.
    editor.blurSelection = null;
  }, []);

  // Slate does not always invoke the onFocus event, e.g. if the editor is busy
  // updating its selection, which means we need to fall back to native events
  // in order to track focusedness correctly.
  useEffect(() => {
    const root = ReactEditor.toDOMNode(editor, editor);

    // Slate does not appreciate re-renders during focus and blur, so these must
    // be executed on the next tick.
    const handleFocus = () => {
      if (!editor.selection && editor.blurSelection) {
        Transforms.select(editor, editor.blurSelection);
      }

      window.setTimeout(() => {
        onFocusedChange?.(true);
      }, 0);
    };
    const handleBlur = () => {
      if (editor.selection !== null) {
        editor.blurSelection = editor.selection;
      }

      window.setTimeout(() => {
        onFocusedChange?.(false);
      }, 0);
    };

    root.addEventListener('focus', handleFocus);
    root.addEventListener('blur', handleBlur);

    return () => {
      root.removeEventListener('focus', handleFocus);
      root.removeEventListener('blur', handleBlur);
    };
  }, [editor, onFocusedChange]);

  return (
    <S.EditorContainer
      className={className}
      singleLine={singleLine}
      toolbarAlwaysVisible={toolbarAlwaysVisible}
      ref={ref}
    >
      <S.Toolbar
        alwaysVisible={toolbarAlwaysVisible}
        onMouseDown={preventFocus}
      >
        {toolbarItems}
      </S.Toolbar>

      <S.Editable
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
