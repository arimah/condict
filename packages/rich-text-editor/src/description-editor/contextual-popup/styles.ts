import styled from 'styled-components';

import {Button, Intent} from '@condict/ui';

export const LinkMain = styled.div`
  display: flex;
  flex-direction: row;
`;

export const LinkTarget = styled.span`
  flex: 1 1 auto;
  padding: 8px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const LinkType = styled.span`
  flex: none;
  padding: 8px 8px 8px 0;
  white-space: nowrap;
  opacity: 0.7;
`;

export const LinkActions = styled.span`
  flex: none;
  padding: 2px 2px 2px 0;
`;

export const LinkButton = styled(Button).attrs({
  intent: Intent.SECONDARY,
  tabIndex: -1,
})`
  padding: 4px 8px;
  border-color: ${p => p.theme.general.altBg};
  background-color: ${p => p.theme.general.altBg};

  &:hover:not(:focus):not(.force-focus) {
    border-color: ${p => p.theme.general.hoverAltBg};
    background-color: ${p => p.theme.general.hoverAltBg};
  }

  &:active:not(:focus):not(.force-focus) {
    border-color: ${p => p.theme.general.activeAltBg};
    background-color: ${p => p.theme.general.activeAltBg};
  }
`;
