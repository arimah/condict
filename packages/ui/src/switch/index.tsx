import {InputHTMLAttributes, LabelHTMLAttributes} from 'react';

import {getContentAndLabel} from '../a11y-utils';
import MarkerLocation from '../marker-location';

import * as S from './styles';

export type Props = {
  label?: string;
  labelProps?: Omit<
    LabelHTMLAttributes<HTMLLabelElement>,
    'className'
  >;
  marker?: MarkerLocation;
} & Partial<S.IntentProps> & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'aria-label' | 'aria-pressed' | 'role' | 'type'
>;

export const Switch = (props: Props): JSX.Element => {
  const {
    className,
    intent = 'accent',
    checked,
    label,
    disabled,
    labelProps,
    marker = 'before',
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
      intent={intent}
      marker={marker}
      className={className}
      disabled={disabled}
    >
      <S.Input
        {...inputProps}
        intent={intent}
        disabled={disabled}
        checked={checked}
        role='button'
        aria-pressed={checked}
        aria-label={ariaLabel}
      />
      <S.Switch>
        <S.Dot/>
      </S.Switch>
      {renderedContent}
    </S.Label>
  );
};

Switch.Content = S.Content;
