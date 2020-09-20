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
import {ReactEditor} from 'slate-react';

import {useStaticCondictEditor} from '../plugin';

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
  onFocus?: (e: FocusEvent<HTMLDivElement>) => void;
  onBlur?: (e: FocusEvent<HTMLDivElement>) => void;
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
    onFocus,
    onBlur,
    children,
  } = props;

  const editor = useStaticCondictEditor();

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
        console.log('Restoring selection to', selection, 'from', editor.selection);
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
  // must execute the handlers on the next tick.
  const handleFocus = useCallback((e: FocusEvent<HTMLDivElement>) => {
    e.persist();
    void Promise.resolve().then(() => {
      onFocus?.(e);
    });
  }, [onFocus]);

  const handleBlur = useCallback((e: FocusEvent<HTMLDivElement>) => {
    e.persist();
    void Promise.resolve().then(() => {
      onBlur?.(e);
    });
  }, [onBlur]);

  return (
    <S.EditorContainer
      className={className}
      singleLine={singleLine}
      toolbarAlwaysVisible={toolbarAlwaysVisible}
      onFocus={handleFocus}
      onBlur={handleBlur}
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
