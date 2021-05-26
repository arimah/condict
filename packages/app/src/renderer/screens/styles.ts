import styled from 'styled-components';

import {Spinner, Radio} from '@condict/ui';

export type LoadingScreenProps = {
  visible: boolean;
};

export const LoadingScreen = styled.main<LoadingScreenProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: center;
  justify-self: center;
  font-size: 24px;
  line-height: 36px;
  opacity: ${p => p.visible ? '1' : '0'};

  transition: opacity ${p => 2 * p.theme.timing.long}ms ease-out;
`;

export const LoadingSpinner = styled(Spinner)`
  color: ${p => p.theme.accent.defaultFg};
`;

export const LoadingText = styled.div`
  margin-top: 8px;
`;

export const MainScreen = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: 1fr;
`;

export const MainContent = styled.main`
  padding: 16px;
  grid-column: 2;
`;

const SidebarMinWidth = 248;

const SidebarMaxWidth = 320;

export const Sidebar = styled.nav`
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  grid-column: 1;
  padding: 16px 8px;
  gap: 8px;

  width: 23vw;
  min-width: ${SidebarMinWidth}px;
  max-width: ${SidebarMaxWidth}px;

  background-color: ${p => p.theme.sidebar.bg};
  color: ${p => p.theme.sidebar.fg};
`;

export const OptionGroup = styled.div.attrs({
  role: 'group',
})`
  margin-bottom: 16px;
`;

export const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 8px;
  margin-bottom: 8px;
`;

export const Option = styled(Radio)`
  &:not(:first-child) {
    margin-top: 2px;
  }

  &:not(:last-child) {
    margin-bottom: 2px;
  }
`;
