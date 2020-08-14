import React, {
  ReactNode,
  Ref,
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
} from 'react';
import {Transforms} from 'slate';

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
    children,
  } = props;

  const editor = useCondictEditor();

  useEffect(() => {
    if (editor.selection !== null) {
      editor.blurSelection = editor.selection;
    }
  }, [editor.selection]);

  const handleFocus = useCallback(() => {
    if (!editor.selection && editor.blurSelection) {
      Transforms.select(editor, editor.blurSelection);
    }
  }, []);

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
        onKeyDown={onKeyDown}
        onFocus={handleFocus}
      />

      {children}
    </S.EditorContainer>
  );
});

BaseEditor.displayName = 'BaseEditor';

export default BaseEditor;
