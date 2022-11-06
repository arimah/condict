import React, {ReactNode, KeyboardEvent} from 'react';

import {renderElement, renderLeaf} from './render';
import * as S from './styles';

export const EditorContainer = S.EditorContainer;

export type BaseEditableProps = {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  toolbarAlwaysVisible: boolean;
  singleLine: boolean;
  readOnly: boolean;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
};

export const BaseEditable = React.memo((
  props: BaseEditableProps
): JSX.Element => {
  const {
    toolbarAlwaysVisible,
    singleLine,
    onKeyDown,
    ...otherProps
  } = props;
  return (
    <S.Editable
      {...otherProps}
      $singleLine={singleLine}
      $toolbarAlwaysVisible={toolbarAlwaysVisible}
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      onKeyDown={onKeyDown}
    />
  );
});

BaseEditable.displayName = 'BaseEditable';

export type EditorToolbarProps = {
  alwaysVisible: boolean;
  children: ReactNode;
};

export const EditorToolbar = (props: EditorToolbarProps): JSX.Element => {
  const {alwaysVisible, children} = props;
  return (
    <S.Toolbar alwaysVisible={alwaysVisible}>
      {children}
    </S.Toolbar>
  );
};
