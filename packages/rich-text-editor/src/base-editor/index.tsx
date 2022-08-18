import React, {
  ReactNode,
  Ref,
  KeyboardEvent,
  MouseEvent,
  FocusEvent,
  useCallback,
} from 'react';

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
  readOnly?: boolean;
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

  // COMPAT: Slate does not appreciate re-renders during focus and blur, so we
  // must execute the focus change handler after a small delay.
  const handleFocusChange = useCallback((e: FocusEvent) => {
    const nextFocus = e.type === 'focus' || e.type === 'focusin'
      ? e.target as Element
      // For blur/focusout, e.relatedTarget is the element that receives focus.
      : e.relatedTarget as Element;
    setTimeout(() => onFocusChanged?.(nextFocus), 5);
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
        onKeyDown={onKeyDown}
      />

      {children}
    </S.EditorContainer>
  );
});

BaseEditor.displayName = 'BaseEditor';

export default BaseEditor;
