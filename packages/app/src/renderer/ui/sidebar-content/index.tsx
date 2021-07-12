import SearchIcon from 'mdi-react/MagnifyIcon';
import SettingsIcon from 'mdi-react/CogIcon';
import {Localized as T} from '@fluent/react';

import TabList from './tab-list';
import * as S from './styles';

// This component implements the *contents* of the sidebar. The container with
// the coloured background is part of the MainScreen.

export type Props = {
  sidebarContainsFocus: () => boolean;
};

const SidebarContent = (props: Props): JSX.Element => {
  const {sidebarContainsFocus} = props;

  return <>
    <S.SearchButton command='global:search'>
      <SearchIcon/>
      <span><T id='sidebar-search-button'/></span>
    </S.SearchButton>

    <TabList sidebarContainsFocus={sidebarContainsFocus}/>

    <S.Button command='global:settings'>
      <SettingsIcon/>
      <span><T id='sidebar-settings-button'/></span>
    </S.Button>
  </>;
};

export default SidebarContent;
