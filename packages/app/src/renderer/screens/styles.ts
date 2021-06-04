import styled from 'styled-components';

import {Spinner} from '@condict/ui';

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
  width: 100vw;
  height: 100vh;
`;

export const MainContent = styled.main`
  box-sizing: border-box;
  grid-column: 2;
  max-height: 100vh;
  overflow: auto;
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
