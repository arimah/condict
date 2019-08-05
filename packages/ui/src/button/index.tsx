import React, {MouseEventHandler, ReactNode, ButtonHTMLAttributes} from 'react';

import {getContentAndLabel} from '@condict/a11y-utils';

import {useCommand} from '../command';

import * as S from './styles';

export type Props = {
  label: string;
  type: 'button' | 'submit';
  command?: string | null;
} & S.Props & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'aria-label'
>;

export const Button = React.forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const {
    label,
    type,
    command: commandName,
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
  minimal: false,
  intent: 'primary',
  slim: false,
  label: '',
  type: 'button',
  command: undefined,
};
