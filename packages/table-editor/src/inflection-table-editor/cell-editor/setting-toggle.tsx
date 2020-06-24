import React, {ChangeEventHandler} from 'react';

import {Checkbox} from '@condict/ui';

import * as S from './styles';

export type Props = {
  checked: boolean;
  label: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

const HeaderToggle = (props: Props): JSX.Element =>
  <S.CellSettingsGroup>
    <Checkbox
      checked={props.checked}
      label={props.label}
      onChange={props.onChange}
    />
  </S.CellSettingsGroup>;

export default HeaderToggle;
