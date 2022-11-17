import React, {Ref, ButtonHTMLAttributes} from 'react';

import {useCommand} from '../command';

import * as S from './styles';

export type Props = {
  type?: 'button' | 'submit';
  command?: string | null;
  slim?: boolean;
  intent?: S.ButtonIntent;
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type'
>;

const Button = React.forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {
    type = 'button',
    command: commandName,
    slim = false,
    intent = 'general',
    disabled,
    onClick,
    children,
    ...otherProps
  } = props;

  const command = useCommand(commandName);

  return (
    <S.Button
      {...otherProps}
      $slim={slim}
      $intent={intent}
      disabled={command !== null ? command.disabled || disabled : disabled}
      onClick={command !== null ? command.exec : onClick}
      type={type}
      ref={ref}
    >
      {children}
    </S.Button>
  );
});

Button.displayName = 'Button';

export default Button;
