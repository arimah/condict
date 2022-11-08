import {InputHTMLAttributes} from 'react';

import MarkerLocation from '../marker-location';

import * as S from './styles';

export type Props = {
  marker?: MarkerLocation;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'aria-pressed' | 'role' | 'type'
>;

export const Switch = (props: Props): JSX.Element => {
  const {
    className,
    checked,
    disabled,
    marker = 'before',
    children,
    ...inputProps
  } = props;

  // Note: The best role for a switch would be 'switch', but browser support
  // for that role is spotty at best. In practice, a toggle button seems to
  // work better.
  return (
    <S.Label marker={marker} className={className} disabled={disabled}>
      <S.Input
        {...inputProps}
        disabled={disabled}
        checked={checked}
        role='button'
        aria-pressed={checked}
      />
      <S.Switch>
        <S.Dot/>
      </S.Switch>
      <S.Content>{children}</S.Content>
    </S.Label>
  );
};

Switch.Content = S.Content;
