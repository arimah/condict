import React, {Ref, ButtonHTMLAttributes} from 'react';

import {getContentAndLabel} from '../a11y-utils';
import {useCommand} from '../command';

import * as S from './styles';

export type Props = {
  label?: string;
  type?: 'button' | 'submit';
  command?: string | null;
} & Partial<S.Props> & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'aria-label'
>;

const Button = React.forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {
    label = '',
    type = 'button',
    command: commandName,
    slim = false,
    bold = false,
    intent = 'general',
    borderless = false,
    disabled,
    onClick,
    children,
    ...otherProps
  } = props;

  const command = useCommand(commandName);

  const [renderedContent, ariaLabel] = getContentAndLabel(children, label);

  return (
    <S.Button
      {...otherProps}
      aria-label={ariaLabel}
      slim={slim}
      bold={bold}
      intent={intent}
      borderless={borderless}
      disabled={command !== null ? command.disabled || disabled : disabled}
      onClick={command !== null ? command.exec : onClick}
      type={type}
      ref={ref}
    >
      {renderedContent}
    </S.Button>
  );
});

Button.displayName = 'Button';

export default Button;
