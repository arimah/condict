import React, {Ref, useRef, useImperativeHandle} from 'react';

import {Panel} from '../../../navigation';
import {TransitionList, ItemPhase} from '../../../ui';

import SidePanel, {SidePanelHandle} from './side-panel';
import * as S from './styles';

export type Props = {
  panels: readonly Panel[];
  visible: boolean;
};

export interface SidePanelListHandle {
  /** Restores keyboard focus to the active side panel. */
  restoreFocus(): void;
}

const SidePanelList = React.forwardRef((
  props: Props,
  ref: Ref<SidePanelListHandle>
): JSX.Element => {
  const {panels, visible} = props;

  const activePanelRef = useRef<SidePanelHandle>(null);

  useImperativeHandle(ref, () => ({
    restoreFocus() {
      activePanelRef.current?.restoreFocus();
    },
  }), []);

  const currentId = panels.length > 0
    ? panels[panels.length - 1].id
    : '';

  return (
    <S.Main $open={panels.length > 0} $visible={visible}>
      <S.Overlay $active={panels.length > 0}/>
      <TransitionList list={panels} getKey={getPanelKey}>
        {(panel, phase, onPhaseEnd) =>
          <SidePanel
            panel={panel}
            state={panelState(panel.id, phase, currentId)}
            entering={phase === 'entering'}
            onPhaseEnd={onPhaseEnd}
            ref={panel.id === currentId ? activePanelRef : undefined}
          />
        }
      </TransitionList>
    </S.Main>
  );
});

SidePanelList.displayName = 'SidePanelList';

export default SidePanelList;

const getPanelKey = (panel: Panel) => panel.id;

const panelState = (
  id: string,
  phase: ItemPhase,
  currentId: string
): S.SidePanelState => {
  if (id === currentId) {
    return 'current';
  }
  if (phase === 'leaving') {
    return 'hidden';
  }
  return 'background';
};
