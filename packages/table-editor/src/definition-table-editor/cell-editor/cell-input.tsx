import React, {Ref, ChangeEventHandler} from 'react';

import {DefinitionTableData, Messages} from '../types';

import * as S from './styles';

export type Props = {
  data: DefinitionTableData;
  defaultForm: string;
  messages: Messages;
  'aria-describedby'?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

const CellInput = React.forwardRef((
  props: Props,
  ref: Ref<HTMLInputElement>
): JSX.Element => {
  const {
    data,
    defaultForm,
    messages,
    'aria-describedby': ariaDescribedBy,
    onChange,
  } = props;
  return (
    <S.CellInput
      value={data.customForm !== null ? data.customForm : defaultForm}
      aria-label={messages.cellValueLabel()}
      aria-describedby={ariaDescribedBy}
      inflected={data.customForm === null}
      onChange={onChange}
      ref={ref}
    />
  );
});

CellInput.displayName = 'CellInput';

export default CellInput;
