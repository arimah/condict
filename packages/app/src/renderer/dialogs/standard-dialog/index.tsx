import React, {
  Ref,
  TransitionEvent,
  HTMLAttributes,
  useState,
  useCallback,
  useRef,
} from 'react';

import {combineRefs} from '@condict/ui';

import {ItemPhase} from '../../ui';
import {useDelayedMountEffect} from '../../hooks';

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

  // HACK: Despite sincere efforts, there are timing issues in React or Chromium
  // or something. Occasionally and quite unpredictably, the setNeedToEnter call
  // occurs *before* the first DOM state has been committed, and the web browser
  // never even runs the transition. Sometimes useLayoutEffect helps, and other
  // times it doesn't. A small forceful delay seems to be the most reliable way
  // of accomplishing this.
  useDelayedMountEffect(5, () => setNeedToEnter(false));

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
