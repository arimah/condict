import React, {Ref, ChangeEventHandler, useState, useCallback} from 'react';

import {CellWithData} from '../../types';

import {DoNotDeriveLemmaIcon, CustomDisplayNameIcon} from '../../icons';
import {InflectionTableData, Messages} from '../types';

import * as S from './styles';

export type Props = {
  value: CellWithData<InflectionTableData>;
  messages: Messages;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

const CellInput = React.forwardRef((
  props: Props,
  ref: Ref<HTMLInputElement>
): JSX.Element => {
  const {value: {cell, data}, messages, onChange} = props;

  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  const needIcons = !cell.header && (
    !data.deriveLemma ||
    data.hasCustomDisplayName
  );
  return (
    <S.CellInputWrapper focus={focused}>
      <S.CellInput
        value={data.text}
        aria-label={messages.cellValueLabel()}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        ref={ref}
      />
      {needIcons &&
        <S.CellIcons>
          {!data.deriveLemma && <DoNotDeriveLemmaIcon/>}
          {data.hasCustomDisplayName && <CustomDisplayNameIcon/>}
        </S.CellIcons>
      }
    </S.CellInputWrapper>
  );
});

CellInput.displayName = 'CellInput';

export default CellInput;
