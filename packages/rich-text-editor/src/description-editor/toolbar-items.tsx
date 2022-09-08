import React from 'react';

import {AllShortcuts} from '../shortcuts';
import {
  HeadingsGroup,
  InlineFormatGroup,
  LinkGroup,
  BlockFormatGroup,
  HelpersGroup,
} from '../toolbar';

import {Messages} from './types';

export type Props = {
  shortcuts: AllShortcuts;
  messages: Messages;
  onOpenLinkDialog: () => void;
  onOpenIpaDialog: () => void;
};

const ToolbarItems = React.memo((props: Props): JSX.Element => {
  const {shortcuts, messages, onOpenLinkDialog, onOpenIpaDialog} = props;
  return <>
    <HeadingsGroup shortcuts={shortcuts} messages={messages}/>
    <InlineFormatGroup shortcuts={shortcuts} messages={messages}/>
    <LinkGroup
      shortcuts={shortcuts}
      messages={messages}
      onSetLink={onOpenLinkDialog}
    />
    <BlockFormatGroup shortcuts={shortcuts} messages={messages}/>
    <HelpersGroup
      shortcuts={shortcuts}
      messages={messages}
      onOpenIpaDialog={onOpenIpaDialog}
    />
  </>;
});

ToolbarItems.displayName = 'ToolbarItems';

export default ToolbarItems;
