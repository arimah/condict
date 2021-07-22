import React, {AnchorHTMLAttributes, MouseEvent, Ref, useCallback} from 'react';
import {Localized} from '@fluent/react';

import {useOpenDialog} from '../dialog-stack';
import {messageBox, MessageBoxButton} from '../dialogs';

export type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick'>;

// TODO: Use an inline popup instead of a disruptive message box

const OkButton: MessageBoxButton<void>[] = [{
  labelKey: 'message-box-ok',
  value: undefined,
  disposition: 'cancel',
}];

const BrokenLink = React.forwardRef((
  props: Props,
  ref: Ref<HTMLAnchorElement>
): JSX.Element => {
  const openDialog = useOpenDialog();

  const handleClick = useCallback((e: MouseEvent) => {
    e.preventDefault();
    void openDialog(messageBox({
      titleKey: 'generic-broken-link-title',
      message: <Localized id='generic-broken-link-message'/>,
      buttons: OkButton,
    }));
  }, [openDialog]);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <a {...props} onClick={handleClick} ref={ref}>
      {props.children}
    </a>
  );
});

BrokenLink.displayName = 'BrokenLink';

export default BrokenLink;
