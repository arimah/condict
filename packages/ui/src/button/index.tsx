import React, {MouseEventHandler, ReactNode, ButtonHTMLAttributes} from 'react';

import {getContentAndLabel} from '@condict/a11y-utils';

import {useCommand} from '../command';

import * as S from './styles';

export type Props = {
  className: string;
  disabled: boolean;
  label: string;
  type: 'button' | 'submit';
  command?: string | null;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
} & S.Props & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'disabled' | 'type' | 'onClick' | 'aria-label'
>;

export const Button = React.forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const {
    disabled,
    label,
    type,
    command: commandName,
    onClick,
    children,
    // className, minimal, intent and slim deliberately included here
    ...otherProps
  } = props;

  const command = useCommand(commandName);

  const [renderedContent, ariaLabel] = getContentAndLabel(children, label);

  return (
    <S.Button
      {...otherProps}
      aria-label={ariaLabel}
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

Button.defaultProps = {
  className: '',
  disabled: false,
  minimal: false,
  intent: 'primary',
  slim: false,
  label: '',
  type: 'button',
  command: undefined,
  onClick: undefined,
};
