import React, {Ref, ChangeEventHandler, MouseEventHandler} from 'react';

import {useUniqueId} from '@condict/ui';

import {Messages} from '../types';

import * as S from './styles';

export type Props = {
  value: string;
  hasCustomName: boolean;
  messages: Messages;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onDeriveName: MouseEventHandler;
};

const DisplayNameInput = React.forwardRef((
  props: Props,
  ref: Ref<HTMLInputElement>
): JSX.Element => {
  const {value, hasCustomName, messages, onChange, onDeriveName} = props;

  const descId = useUniqueId();

  return (
    <S.CellSettingsGroup>
      <S.DisplayNameLabel>
        {messages.formNameLabel()}
        <S.DisplayNameInput
          minimal
          value={value}
          aria-describedby={hasCustomName ? undefined : descId}
          onChange={onChange}
          ref={ref}
        />
      </S.DisplayNameLabel>
      {hasCustomName ? (
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
