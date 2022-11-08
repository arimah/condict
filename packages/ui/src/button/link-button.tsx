import React, {Ref, MouseEventHandler, AnchorHTMLAttributes} from 'react';

import {useCommand} from '../command';

import * as S from './styles';

export type Props = {
  href: string;
  command?: string | null;
} & Partial<S.Props> & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'role' | 'type'
>;

// Links do not have a 'disabled' prop, so if the link has a ccommand that
// is disabled, we have to cancel the click like this. You probably shouldn't
// attach a disableable command to a link to begin with, to be fair...
const cancelClickEvent: MouseEventHandler = e => {
  e.preventDefault();
};

const LinkButton = React.forwardRef((
  props: Props,
  ref: Ref<HTMLAnchorElement>
) => {
  const {
    command: commandName,
    slim = false,
    intent = 'general',
    onClick,
    children,
    ...otherProps
  } = props;

  const command = useCommand(commandName);

  return (
    <S.Link
      {...otherProps}
      role='button'
      slim={slim}
      intent={intent}
      onClick={
        command !== null
          ? (command.disabled ? cancelClickEvent : command.exec)
          : onClick
      }
      ref={ref}
    >
      {children}
    </S.Link>
  );
});

LinkButton.displayName = 'LinkButton';

export default LinkButton;
