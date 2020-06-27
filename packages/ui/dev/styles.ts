import styled, {createGlobalStyle} from 'styled-components';

export const AppStyles = createGlobalStyle`
  body {
    background-color: ${p => p.theme.general[
      p.theme.dark ? 'hoverBg' : 'activeBg'
    ]};
    color: ${p => p.theme.general.fg};
  }

  #app-root {
    margin-left: auto;
    margin-right: auto;
    max-width: 1100px;
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 32px;
`;

export const MainNav = styled.nav`
  flex: 0 2 200px;

  ul {
    list-style-type: none;
    padding-left: 0;
  }

  li:not(:first-child) {
    margin-top: 8px;
  }

  a,
  a:visited {
    display: inline-block;
    color: ${p => p.theme.link.color};
  }

  a:hover {
    color: ${p => p.theme.link.hover};
  }

  a:active {
    color: ${p => p.theme.link.active};
  }

  a.current {
    font-weight: bold;
    color: ${p => p.theme.secondary.fg};
  }
`;

export const CurrentDemo = styled.main`
  flex: 1 1 auto;

  > section:first-child > h2:first-child {
    margin-top: 0;
  }
`;

export const Group = styled.p`
  & > :not(:last-child) {
    margin-right: 16px;
  }
`;
