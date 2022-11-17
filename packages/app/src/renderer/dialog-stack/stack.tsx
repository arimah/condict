import {useRef} from 'react';
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
        <DialogItem
          dialog={dialog}
          phase={phase}
          backdrop={dialog.id === backdropId}
          focusTrap={focusTrapActive(dialog.id, phase, currentId)}
          onAnimationPhaseEnd={onAnimationPhaseEnd}
        />
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

type DialogItemProps = {
  dialog: Dialog;
  phase: ItemPhase;
  backdrop: boolean;
  focusTrap: 'active' | 'paused' | 'disabled';
  onAnimationPhaseEnd: () => void;
};

const DialogItem = (props: DialogItemProps): JSX.Element => {
  const {dialog, phase, backdrop, focusTrap, onAnimationPhaseEnd} = props;

  // We can't rely entirely on FocusTrap's onPointerDownOutside to detect clicks
  // outside the dialog, since the S.Container covers the entire screen.

  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <FocusTrap
      active={focusTrap}
      onPointerDownOutside={dialog.onPointerDownOutside}
    >
      <S.Container
        $active={phase !== 'leaving'}
        $backdrop={backdrop}
        onMouseDown={dialog.onPointerDownOutside && (e => {
          if (e.target === containerRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            dialog.onPointerDownOutside!();
          }
        })}
        ref={containerRef}
      >
        {dialog.render({
          animationPhase: phase,
          onAnimationPhaseEnd,
        })}
      </S.Container>
    </FocusTrap>
  );
};
