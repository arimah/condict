import styled from 'styled-components';

const SidebarIdealWidth = '24vw';

const SidebarMinWidth = '264px';

const SidebarMaxWidth = '336px';

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
  width: calc(
    100vw - clamp(
      ${SidebarMinWidth},
      ${SidebarIdealWidth},
      ${SidebarMaxWidth}
    )
  );
  height: 100vh;
  position: relative;
`;

export const Sidebar = styled.nav`
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  grid-column: 1;
  padding: 24px 16px;
  gap: 8px;

  width: ${SidebarIdealWidth};
  min-width: ${SidebarMinWidth};
  max-width: ${SidebarMaxWidth};
  height: 100vh;

  background-color: ${p => p.theme.sidebar.bg};
  color: ${p => p.theme.sidebar.fg};
`;
