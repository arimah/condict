import styled from 'styled-components';

import {Button} from '@condict/ui';

export type TabPanelProps = {
  isCurrent?: boolean;
};

export const TabPanel = styled.div.attrs({
  role: 'tabpanel',
  tabIndex: -1,
})<TabPanelProps>`
  display: ${p => p.isCurrent ? 'flex' : 'none'};
  flex-direction: row;
  min-height: 100%;

  &:focus {
    outline: none;
  }
`;

export const BackButtonColumn = styled.div`
  flex: 0 0 32px;
  padding-top: 16px;
  padding-left: 16px;
  position: sticky;
  top: 0;
`;

export const BackButton = styled(Button)`
  padding: 2px;

  background-color: ${p => p.theme.defaultBg};
  border-color: ${p => p.theme.defaultBg};
  color: ${p => p.theme.defaultFg};

  &:hover {
    background-color: ${p => p.theme.defaultHoverBg};
    border-color: ${p => p.theme.defaultHoverBg};
  }

  &:active {
    background-color: ${p => p.theme.defaultActiveBg};
    border-color: ${p => p.theme.defaultActiveBg};
  }

  &:focus {
    border-color: ${p => p.theme.focus.color};
  }

  > .mdi-icon.mdi-icon {
    display: block;
    margin: 0;
  }
`;

export const MainColumn = styled.div`
  padding: 16px;
  flex: 1 1 auto;
`;
