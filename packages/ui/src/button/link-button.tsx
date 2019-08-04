import React, {MouseEventHandler, ReactNode, AnchorHTMLAttributes} from 'react';

import {getContentAndLabel} from '@condict/a11y-utils';

import {useCommand} from '../command';

import * as S from './styles';

export type Props = {
  className: string;
  label: string;
  href: string;
  command?: string | null;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: ReactNode;
} & S.Props & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'aria-label' | 'className' | 'href' | 'onClick' | 'role' | 'type'
>;

// Links do not have a 'disabled' prop, so if the link has a ccommand that
// is disabled, we have to cancel the click like this. You probably shouldn't
// attach a disableable command to a link to begin with, to be fair...
const cancelClickEvent: MouseEventHandler = e => {
  e.preventDefault();
};

export const LinkButton = React.forwardRef<HTMLAnchorElement, Props>((props, ref) => {
  const {
    label,
    href,
    command: commandName,
    onClick,
    children,
    // className, minimal, intent and slim deliberately included here
    ...otherProps
  } = props;

  const command = useCommand(commandName);

  const [renderedContent, ariaLabel] = getContentAndLabel(children, label);

  return (
    <S.Link
      role='button'
      {...otherProps}
      aria-label={ariaLabel}
      onClick={
        command !== null
          ? (command.disabled ? cancelClickEvent : command.exec)
          : onClick
      }
      href={href}
      ref={ref}
    >
      {renderedContent}
    </S.Link>
  );
});
LinkButton.displayName = 'LinkButton';

LinkButton.defaultProps = {
  className: '',
  minimal: false,
  intent: 'primary',
  slim: false,
  label: '',
  command: undefined,
  onClick: undefined,
};
