import {useState, useEffect} from 'react';
import SearchIcon from 'mdi-react/MagnifyIcon';
import SettingsIcon from 'mdi-react/CogIcon';
import DownloadIcon from 'mdi-react/DownloadIcon';
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

  // FIXME: remove this temporary testing code
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setUpdateAvailable(true);
    }, Math.round(2000 + 4000 * Math.random()));
  }, []);

  return <>
    <S.SearchButton command='global:search'>
      <SearchIcon/>
      <span><T id='sidebar-search-button'/></span>
    </S.SearchButton>

    <TabList sidebarContainsFocus={sidebarContainsFocus}/>

    {updateAvailable &&
      <S.Button command='global:update'>
        <DownloadIcon/>
        <span><T id='sidebar-update-button'/></span>
      </S.Button>
    }
    <S.Button command='global:settings'>
      <SettingsIcon/>
      <span><T id='sidebar-settings-button'/></span>
    </S.Button>
  </>;
};

export default SidebarContent;
