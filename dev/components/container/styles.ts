import styled, {createGlobalStyle} from 'styled-components';

import {Gray} from '@condict/ui';

export const AppStyles = createGlobalStyle`
  body {
    background-color: ${p => p.theme.mode === 'dark'
      ? Gray.pale[7]
      : Gray.pale[0]
    };
    color: ${p => p.theme.defaultFg};
  }

  a.current {
    font-weight: bold;
    color: ${p => p.theme.defaultFg};
  }
`;

export const Container = styled.div`
  margin-inline: auto;
  padding-inline: 32px;
  max-width: 1100px;
`;

export const Header = styled.header`
  display: flex;
  flex-direction: row;

  > h1 {
    flex: 1 1 auto;
    margin-top: 24px;
  }
`;

export const HeaderSwitch = styled.div`
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  margin-block: 16px 0;
  margin-inline: 16px 0;
  vertical-align: 3px;

  > * {
    flex: none;
  }
`;

export const MainNav = styled.nav`
  margin: 16px;
  font-size: 18px;
  text-align: center;
`;

export const NavSeparator = styled.span`
  display: inline-block;
  margin-inline: 16px;
  width: 7px;
  height: 7px;
  vertical-align: 1px;
  border-radius: 50%;
  background-color: ${p => p.theme.defaultFg};
`;
