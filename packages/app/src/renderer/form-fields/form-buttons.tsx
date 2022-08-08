import React, {ReactNode, useState} from 'react';
import {Localized} from '@fluent/react';

import {useNearestForm, useFormState} from '../form';
import {Loading} from '../ui';

import useFormButtonsStickiness from './form-buttons-stickiness';
import * as S from './styles';

export type Props = {
  submitLabel?: ReactNode;
  cancelLabel?: ReactNode;
  loadingLabel?: ReactNode;
  submitError?: ReactNode;
  onCancel: () => void;
};

export const FormButtons = React.memo((props: Props): JSX.Element => {
  const {submitLabel, cancelLabel, loadingLabel, submitError, onCancel} = props;

  const form = useNearestForm();
  const {isSubmitting} = useFormState(form);

  const [stuck, setStuck] = useState(false);
  const mainRef = useFormButtonsStickiness(setStuck);

  return (
    <S.FormButtons stuck={stuck} ref={mainRef}>
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
});

FormButtons.displayName = 'FormButtons';
