import {ReactNode, useState, useCallback} from 'react';
import {Localized} from '@fluent/react';

import {Button} from '@condict/ui';

import {ExecuteError} from '../../../types';

import ConfirmDeletePopup from './popup';
import * as S from './styles';

export type Props = {
  canDelete: boolean;
  description: ReactNode;
  confirmLabel: ReactNode;
  deleteError: ReactNode;
  onExecuteDelete: () => Promise<readonly ExecuteError[] | undefined | null>;
  onAfterDelete: () => void;
};

const ConfirmDeleteButton = (props: Props): JSX.Element => {
  const {
    canDelete,
    description,
    confirmLabel,
    deleteError,
    onExecuteDelete,
    onAfterDelete,
  } = props;

  const [popupOpen, setPopupOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  const openPopup = useCallback(() => setPopupOpen(true), []);
  const closePopup = useCallback(() => setPopupOpen(false), []);

  const handleConfirm = useCallback(() => {
    void onExecuteDelete().then(errors => {
      if (errors) {
        setHasError(true);
      } else {
        closePopup();
        onAfterDelete();
      }
    });
  }, [closePopup, onExecuteDelete, onAfterDelete]);

  return (
    <S.Main>
      <Button intent='danger' onClick={openPopup}>
        <Localized id='generic-delete-button'/>
      </Button>
      {popupOpen &&
        <ConfirmDeletePopup
          canDelete={canDelete}
          description={description}
          confirmLabel={confirmLabel}
          deleteError={hasError && deleteError}
          onConfirm={handleConfirm}
          onCancel={closePopup}
        />}
    </S.Main>
  );
};

export default ConfirmDeleteButton;
