import React, {
  FocusEvent,
  TransitionEvent,
  Ref,
  useState,
  useCallback,
  useRef,
  useImperativeHandle,
  useLayoutEffect,
} from 'react';

import {FocusScope, getTabReachable} from '@condict/ui';

import {Panel} from '../../../navigation';

import * as S from './styles';

export type Props = {
  panel: Panel;
  state: S.SidePanelState;
  entering: boolean;
  onPhaseEnd: () => void;
};

export interface SidePanelHandle {
  /** Restores keyboard focus to the side panel. */
  restoreFocus(): void;
}

const SidePanel = React.forwardRef((
  props: Props,
  ref: Ref<SidePanelHandle>
): JSX.Element => {
  const {panel, state, entering, onPhaseEnd} = props;

  const [needToEnter, setNeedToEnter] = useState(true);

  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const handleFocus = useCallback((e: FocusEvent) => {
    lastFocus.current = e.target as HTMLElement;
  }, []);

  useImperativeHandle(ref, () => ({
    restoreFocus() {
      const panel = panelRef.current;
      if (!panel) {
        return;
      }

      // Try to focus lastFocus, if the element is still valid. It might have
      // become invalid if the panel was updated while focus was outside it,
      // in which case we'll have a reference to a removed element.
      if (lastFocus.current && panel.contains(lastFocus.current)) {
        lastFocus.current.focus({preventScroll: true});
        return;
      }

      // If lastFocus was not valid, try to find the first focusable element in
      // the panel.
      const focusable = getTabReachable(panel, {includeRoot: false});
      if (focusable.length > 0) {
        (focusable[0] as HTMLElement).focus({preventScroll: true});
        return;
      }

      // If all else fails, focus the panel itself.
      panel.focus({preventScroll: true});
    },
  }), []);

  useLayoutEffect(() => {
    setNeedToEnter(false);
  }, []);

  const handleTransitionEnd = useCallback((e: TransitionEvent) => {
    // transitionend bubbles - we don't want to catch it for descendant nodes.
    if (e.target === panelRef.current) {
      onPhaseEnd();
    }
  }, [onPhaseEnd]);

  return (
    <FocusScope active={state === 'current'}>
      <S.SidePanel
        state={needToEnter ? 'hidden' : state}
        entering={entering}
        onFocus={handleFocus}
        onTransitionEnd={handleTransitionEnd}
        ref={panelRef}
      >
        <S.Content>
          {panel.render()}
        </S.Content>
        <S.Overlay active={state === 'background'}/>
      </S.SidePanel>
    </FocusScope>
  );
});

SidePanel.displayName = 'SidePanel';

export default SidePanel;
