import React, {InputHTMLAttributes, LabelHTMLAttributes} from 'react';
import PropTypes from 'prop-types';

import {getContentAndLabel} from '@condict/a11y-utils';

import Intent from '../intent';

import * as S from './styles';

export type Props = {
  label?: string;
  labelProps?: Omit<
    LabelHTMLAttributes<HTMLLabelElement>,
    'className'
  >;
} & Partial<S.IntentProps> & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'aria-label' | 'aria-pressed' | 'role'
>;

export const Switch = (props: Props) => {
  const {
    className,
    intent = Intent.PRIMARY,
    checked,
    label,
    disabled,
    labelProps,
    children,
    ...inputProps
  } = props;

  const [renderedContent, ariaLabel] = getContentAndLabel(children, label);

  // Note: The best role for a switch would be 'switch', but browser support
  // for that role is spotty at best. In practice, a toggle button seems to
  // work better.
  return (
    <S.Label
      {...labelProps}
      className={className}
      disabled={disabled}
    >
      <S.SwitchContainer>
        <S.Switch
          disabled={disabled}
          intent={intent}
          checked={checked}
        >
          <S.Dot
            disabled={disabled}
            intent={intent}
            checked={checked}
          />
        </S.Switch>
        <S.Input
          {...inputProps}
          disabled={disabled}
          checked={checked}
          role='button'
          aria-pressed={checked ? 'true' : 'false'}
          aria-label={ariaLabel}
        />
      </S.SwitchContainer>
      {renderedContent}
    </S.Label>
  );
};
