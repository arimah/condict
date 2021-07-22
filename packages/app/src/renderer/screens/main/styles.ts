import styled from 'styled-components';

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
  height: 100vh;
  position: relative;
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
  max-height: 100vh;

  background-color: ${p => p.theme.sidebar.bg};
  color: ${p => p.theme.sidebar.fg};
`;
