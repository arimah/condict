import styled from 'styled-components';

import {FlowContent, NakedButton} from '../../../ui';

export type TabPanelProps = {
  isCurrent?: boolean;
};

export const TabPanel = styled.div.attrs({
  role: 'tabpanel',
  tabIndex: -1,
})<TabPanelProps>`
  display: ${p => p.isCurrent ? 'flex' : 'none'};
  flex-direction: row;
  height: 100%;
  overflow: auto;
  align-items: flex-start;
  justify-content: center;

  &:focus {
    outline: none;
  }
`;

export const BackButtonColumn = styled.div`
  flex: 0 0 32px;
  padding-top: 24px;
  padding-inline-start: 16px;
  position: sticky;
  top: 0;
`;

export const BackButton = styled(NakedButton)`
  padding: 2px;

  > .mdi-icon.mdi-icon {
    display: block;
    margin: 0;
  }
`;

export const MainColumn = styled.div`
  padding-block: 24px;
  padding-inline: 16px 32px;
  flex: 1 1 auto;
  overflow: auto;

  h1 {
    margin-top: 36px;
    margin-bottom: 12px;
  }

  > :first-child,
  > ${FlowContent}:first-child > :first-child {
    margin-top: 0;
  }
`;

export const ErrorPage = styled.div.attrs({
  tabIndex: -1,
})`
  flex: 1 1 auto;
  margin: 32px 64px;
  align-self: center;
  justify-self: center;
  max-width: 600px;

  &:focus {
    outline: none;
  }
`;
