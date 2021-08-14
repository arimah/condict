import {ReactNode} from 'react';
import {useFormContext} from 'react-hook-form';
import {Localized} from '@fluent/react';

import {Loading} from '../ui';

import * as S from './styles';

export type Props = {
  submitLabel?: ReactNode;
  cancelLabel?: ReactNode;
  loadingLabel?: ReactNode;
  submitError?: ReactNode;
  onCancel: () => void;
};

export const FormButtons = (props: Props): JSX.Element => {
  const {submitLabel, cancelLabel, loadingLabel, submitError, onCancel} = props;
  const {formState: {isSubmitting}} = useFormContext();
  return (
    <S.FormButtons>
      <S.SubmitButton aria-busy={isSubmitting}>
        {submitLabel ?? <Localized id='generic-form-save'/>}
      </S.SubmitButton>
      <S.CancelButton disabled={isSubmitting} onClick={onCancel}>
        {cancelLabel ?? <Localized id='generic-form-cancel'/>}
      </S.CancelButton>
      {isSubmitting &&
        <Loading small delay={100}>
          {loadingLabel ?? <Localized id='generic-saving'/>}
        </Loading>
      }
      <S.SubmitError>
        {submitError}
      </S.SubmitError>
    </S.FormButtons>
  );
};
