import {
  ReactNode,
  MouseEvent,
  KeyboardEvent,
  DragEvent,
  useCallback,
  useRef,
} from 'react';

import * as S from './styles';

export type Props = {
  title: ReactNode;
  iconBefore?: ReactNode;
  iconAfter?: ReactNode;
  className?: string;
  onClick: () => void;
  children?: ReactNode;
};

const cancelEvent = (e: MouseEvent | DragEvent) => {
  e.preventDefault();
};

export const ActionCard = (props: Props): JSX.Element => {
  const {title, iconBefore, iconAfter, className, onClick, children} = props;

  const handleClick = useCallback((e: MouseEvent) => {
    // Prevent default navigation
    e.preventDefault();
    onClick();
  }, [onClick]);

  // Links don't activate on space, but buttons have to. Unlike Enter, we must
  // activate when the spacebar is *released*, and only if it was pressed down
  // on the button. Yes, it's arbitrary and weird.
  const spaceDown = useRef(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === ' ') {
      e.preventDefault();
      spaceDown.current = true;
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === ' ') {
      e.preventDefault();
      if (spaceDown.current) {
        onClick();
      }
      spaceDown.current = false;
    }
  }, [onClick]);

  const handleBlur = useCallback(() => {
    spaceDown.current = false;
  }, []);

  return (
    <S.ActionCard
      href='#'
      className={className}
      onClick={handleClick}
      onAuxClick={cancelEvent}
      onDragStart={cancelEvent}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={handleBlur}
    >
      {iconBefore}
      <div>
        <S.Title>{title}</S.Title>
        {children && <S.Content>{children}</S.Content>}
      </div>
      {iconAfter}
    </S.ActionCard>
  );
};
