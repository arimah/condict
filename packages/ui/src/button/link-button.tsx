import React, {MouseEventHandler, ReactNode, AnchorHTMLAttributes} from 'react';

import {getContentAndLabel} from '@condict/a11y-utils';

import {useCommand} from '../command';
import Intent from '../intent';

import * as S from './styles';

export type Props = {
  label?: string;
  href: string;
  command?: string | null;
} & Partial<S.Props> & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'aria-label' | 'href' | 'role' | 'type'
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
    command: commandName,
    slim = false,
    minimal = false,
    intent = Intent.PRIMARY,
    onClick,
    children,
    ...otherProps
  } = props;

  const command = useCommand(commandName);

  const [renderedContent, ariaLabel] = getContentAndLabel(children, label);

  return (
    <S.Link
      {...otherProps}
      role='button'
      aria-label={ariaLabel}
      slim={slim}
      minimal={minimal}
      intent={intent}
      onClick={
        command !== null
          ? (command.disabled ? cancelClickEvent : command.exec)
          : onClick
      }
      ref={ref}
    >
      {renderedContent}
    </S.Link>
  );
});

LinkButton.displayName = 'LinkButton';
