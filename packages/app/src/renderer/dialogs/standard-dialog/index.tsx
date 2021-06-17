import React, {
  Ref,
  TransitionEvent,
  HTMLAttributes,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from 'react';

import {combineRefs} from '@condict/ui';

import {ItemPhase} from '../../ui';

import * as S from './styles';

export type Props = {
  title: string;
  animationPhase: ItemPhase;
  onAnimationPhaseEnd: () => void;
} & Omit<
  HTMLAttributes<HTMLDivElement>,
  'aria-label' | 'title' | 'tabIndex' | 'role'
>;

const StandardDialog = React.forwardRef((
  props: Props,
  ref: Ref<HTMLDivElement>
): JSX.Element => {
  const {
    title,
    animationPhase,
    onAnimationPhaseEnd,
    children,
    ...otherProps
  } = props;

  const [needToEnter, setNeedToEnter] = useState(true);

  const dialogRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setNeedToEnter(false);
  }, []);

  const handleTransitionEnd = useCallback((e: TransitionEvent) => {
    // transitionend bubbles - we don't want to catch it for descendant nodes.
    if (e.target === dialogRef.current) {
      onAnimationPhaseEnd();
    }
  }, [onAnimationPhaseEnd]);

  return (
    <S.Main
      {...otherProps}
      aria-label={title}
      visible={!needToEnter && animationPhase !== 'leaving'}
      onTransitionEnd={handleTransitionEnd}
      ref={combineRefs(dialogRef, ref)}
    >
      {children}
    </S.Main>
  );
});

StandardDialog.displayName = 'StandardDialog';

export default StandardDialog;
