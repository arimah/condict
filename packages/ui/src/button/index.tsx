import React, {MouseEventHandler, ReactNode, ButtonHTMLAttributes} from 'react';

import {getContentAndLabel} from '@condict/a11y-utils';

import {useCommand} from '../command';
import Intent from '../intent';

import * as S from './styles';

export type Props = {
  label?: string;
  type?: 'button' | 'submit';
  command?: string | null;
} & Partial<S.Props> & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'aria-label'
>;

export const Button = React.forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const {
    label = '',
    type = 'button',
    command: commandName,
    slim = false,
    minimal = false,
    intent = Intent.PRIMARY,
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
      minimal={minimal}
      intent={intent}
      disabled={command !== null ? command.disabled : disabled}
      onClick={command !== null ? command.exec : onClick}
      type={type}
      ref={ref}
    >
      {renderedContent}
    </S.Button>
  );
});

Button.displayName = 'Button';
