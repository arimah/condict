import React, {Ref, ReactNode, KeyboardEvent, useCallback} from 'react';

import EditorShortcuts from '../editor-shortcuts';

import * as S from './styles';

export type Props = {
  id: string;
  'aria-label': string;
  'aria-describedby': string;
  onRequestClose: () => void;
  children: ReactNode;
};

const CellDialog = React.forwardRef((
  props: Props,
  ref: Ref<HTMLDivElement>
): JSX.Element => {
  const {
    id,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    onRequestClose,
    children,
  } = props;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't allow keydown events to escape past the cell editor.
    e.stopPropagation();

    // Allow Enter to work with buttons.
    if (
      e.key === 'Enter' &&
      document.activeElement &&
      document.activeElement.tagName === 'BUTTON'
    ) {
      return;
    }

    const cmd = EditorShortcuts.get(e);
    if (cmd && cmd.command === 'commit') {
      e.preventDefault();
      onRequestClose();
    }
  }, [onRequestClose]);

  return (
    <S.CellDialog
      id={id}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      onKeyDown={handleKeyDown}
      ref={ref}
    >
      {children}
    </S.CellDialog>
  );
});

CellDialog.displayName = 'CellDialog';

export default CellDialog;
