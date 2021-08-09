import {ReactNode, KeyboardEvent, useState, useCallback} from 'react';
import {Localized, useLocalization} from '@fluent/react';

import {FocusTrap, BodyText, Shortcut} from '@condict/ui';

import {CancelKey} from '../../shortcuts';
import {useDelayedMountEffect} from '../../hooks';

import * as S from './styles';

export type Props = {
  canDelete: boolean;
  description: ReactNode;
  confirmLabel: ReactNode;
  deleteError?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDeletePopup = (props: Props): JSX.Element => {
  const {
    canDelete,
    description,
    confirmLabel,
    deleteError,
    onConfirm,
    onCancel,
  } = props;

  const {l10n} = useLocalization();

  const [visible, setVisible] = useState(false);
  useDelayedMountEffect(1, () => setVisible(true));

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!e.isDefaultPrevented() && Shortcut.matches(CancelKey, e)) {
      onCancel();
    }
  }, [onCancel]);

  return (
    <FocusTrap onPointerDownOutside={onCancel}>
      <S.Popup
        aria-label={l10n.getString('part-of-speech-delete-title')}
        $visible={visible}
        onKeyDown={handleKeyDown}
      >
        <BodyText>
          {description}
        </BodyText>
        {deleteError && <S.ErrorMessage>{deleteError}</S.ErrorMessage>}
        {canDelete ? (
          <S.ConfirmButton onConfirm={onConfirm}>
            {confirmLabel}
          </S.ConfirmButton>
        ) : (
          <S.CloseButton onClick={onCancel}>
            <Localized id='generic-close-button'/>
          </S.CloseButton>
        )}
      </S.Popup>
    </FocusTrap>
  );
};

export default ConfirmDeletePopup;
