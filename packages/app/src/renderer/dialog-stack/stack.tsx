import ReactDOM from 'react-dom';

import {FocusTrap} from '@condict/ui';

import {ItemPhase, TransitionList} from '../ui';

import {Dialog} from './types';
import * as S from './styles';

export type Props = {
  dialogs: readonly Dialog[];
};

let portalRoot: HTMLDivElement | null = null;

const getPortalRoot = (): HTMLDivElement => {
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    document.body.appendChild(portalRoot);
  }
  return portalRoot;
};

const getKey = (dialog: Dialog): string => dialog.id;

const DialogStack = (props: Props): JSX.Element => {
  const {dialogs} = props;
  const currentId = dialogs.length > 0
    ? dialogs[dialogs.length - 1].id
    : '';
  return ReactDOM.createPortal(
    <TransitionList list={dialogs} getKey={getKey}>
      {(dialog, phase, onAnimationPhaseEnd) =>
        <FocusTrap active={focusTrapActive(dialog.id, phase, currentId)}>
          <S.Container active={phase !== 'leaving'}>
            {dialog.render({
              animationPhase: phase,
              onAnimationPhaseEnd,
            })}
          </S.Container>
        </FocusTrap>
      }
    </TransitionList>,
    getPortalRoot()
  );
};

export default DialogStack;

const focusTrapActive = (
  id: string,
  phase: ItemPhase,
  currentId: string
): 'active' | 'paused' | 'disabled' => {
  if (id === currentId) {
    return 'active';
  }
  if (phase === 'leaving') {
    return 'disabled';
  }
  return 'paused';
};
