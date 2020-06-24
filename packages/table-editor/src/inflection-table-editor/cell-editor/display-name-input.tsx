import React, {
  Ref,
  ChangeEventHandler,
  MouseEventHandler,
  useMemo,
} from 'react';

import genId from '@condict/gen-id';

import {InflectionTableData, Messages} from '../types';

import * as S from './styles';

export type Props = {
  data: InflectionTableData;
  messages: Messages;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onDeriveName: MouseEventHandler;
};

const DisplayNameInput = React.forwardRef((
  props: Props,
  ref: Ref<HTMLInputElement>
): JSX.Element => {
  const {data, messages, onChange, onDeriveName} = props;

  const descId = useMemo(genId, []);

  return (
    <S.CellSettingsGroup>
      <S.DisplayNameLabel>
        {messages.formNameLabel()}
        <S.DisplayNameInput
          minimal
          value={data.displayName}
          aria-describedby={
            data.hasCustomDisplayName
              ? undefined
              : descId
          }
          onChange={onChange}
          ref={ref}
        />
      </S.DisplayNameLabel>
      {data.hasCustomDisplayName ? (
        <S.DeriveDisplayNameButton
          label={messages.useAutomaticNameButton()}
          onClick={onDeriveName}
        />
      ) : (
        <S.DisplayNameDesc id={descId}>
          {messages.automaticNameHelper()}
        </S.DisplayNameDesc>
      )}
    </S.CellSettingsGroup>
  );
});

DisplayNameInput.displayName = 'DisplayNameInput';

export default DisplayNameInput;
