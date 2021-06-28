import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 32px;
`;

export const Nav = styled.nav`
  flex: 0 0 200px;

  ul {
    list-style-type: none;
    padding-inline-start: 0;
  }

  li:not(:first-child) {
    margin-top: 8px;
  }

  a {
    display: inline-block;
  }

  a.current {
    color: ${p => p.theme.defaultFg};
  }
`;

export const Main = styled.main`
  flex: 1 1 auto;

  > section:first-child > h2:first-child {
    margin-top: 0;
  }
`;
