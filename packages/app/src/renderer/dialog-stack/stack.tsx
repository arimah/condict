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

  // We want to avoid stacking backdrops, as it just doesn't look very nice, so
  // we put it behind the last (topmost) dialog that has a backdrop. That way,
  // it covers everything below it, as advertised.
  const backdropId = getLastDialogWithBackdropId(dialogs);

  return ReactDOM.createPortal(
    <TransitionList list={dialogs} getKey={getKey}>
      {(dialog, phase, onAnimationPhaseEnd) =>
        <FocusTrap active={focusTrapActive(dialog.id, phase, currentId)}>
          <S.Container
            active={phase !== 'leaving'}
            backdrop={dialog.id === backdropId}
          >
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

const getLastDialogWithBackdropId = (dialogs: readonly Dialog[]): string => {
  for (let i = dialogs.length - 1; i >= 0; i--) {
    const dialog = dialogs[i];
    if (dialog.backdrop) {
      return dialog.id;
    }
  }
  return '';
};

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
