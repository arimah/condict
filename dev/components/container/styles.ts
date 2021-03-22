import styled, {createGlobalStyle} from 'styled-components';

export const AppStyles = createGlobalStyle`
  body {
    background-color: ${p => p.theme.general[
      p.theme.dark ? 'hoverBg' : 'activeBg'
    ]};
    color: ${p => p.theme.general.fg};
  }

  a.current {
    font-weight: bold;
    color: ${p => p.theme.general.fg};
  }
`;

export const Container = styled.div`
  margin-left: auto;
  margin-right: auto;
  max-width: 1100px;
`;

export const Header = styled.header`
  display: flex;
  flex-direction: row;

  > h1 {
    flex: 1 1 auto;
  }
`;

export const HeaderSwitch = styled.div`
  flex: 0 0 200px;
  margin: 16px;
  vertical-align: 3px;
`;

export const MainNav = styled.nav`
  margin: 16px;
  font-size: 18px;
  text-align: center;
`;

export const NavSeparator = styled.span`
  display: inline-block;
  margin-left: 16px;
  margin-right: 16px;
  width: 7px;
  height: 7px;
  vertical-align: 1px;
  border-radius: 50%;
  background-color: ${p => p.theme.general.fg};
`;
