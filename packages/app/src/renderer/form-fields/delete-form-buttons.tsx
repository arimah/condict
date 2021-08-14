import {ReactNode} from 'react';
import {Localized} from '@fluent/react';

import {Loading} from '../ui';

import * as S from './styles';

export type Props = {
  deleteLabel?: ReactNode;
  cancelLabel?: ReactNode;
  loadingLabel?: ReactNode;
  deleteError?: ReactNode;
  isDeleting?: boolean;
  onDelete: () => void;
  onCancel: () => void;
};

export const DeleteFormButtons = (props: Props): JSX.Element => {
  const {
    deleteLabel,
    cancelLabel,
    loadingLabel,
    deleteError,
    isDeleting,
    onDelete,
    onCancel,
  } = props;
  return (
    <S.FormButtons>
      <S.DeleteButton aria-busy={isDeleting} onConfirm={onDelete}>
        {deleteLabel ?? <Localized id='generic-delete-button'/>}
      </S.DeleteButton>
      <S.CancelButton disabled={isDeleting} onClick={onCancel}>
        {cancelLabel ?? <Localized id='generic-form-cancel'/>}
      </S.CancelButton>
      {isDeleting &&
        <Loading small delay={100}>
          {loadingLabel ?? <Localized id='generic-saving'/>}
        </Loading>
      }
      <S.SubmitError>
        {deleteError}
      </S.SubmitError>
    </S.FormButtons>
  );
};
