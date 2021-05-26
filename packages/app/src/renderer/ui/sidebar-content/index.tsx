import {useState, useEffect} from 'react';
import SearchIcon from 'mdi-react/MagnifyIcon';
import SettingsIcon from 'mdi-react/CogIcon';
import DownloadIcon from 'mdi-react/DownloadIcon';

import TabList from './tab-list';
import * as S from './styles';

// This component implements the *contents* of the sidebar. The container with
// the coloured background is part of the MainScreen.

const SidebarContent = (): JSX.Element => {
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
      <span>Search the dictionary</span>
    </S.SearchButton>

    <TabList/>

    {updateAvailable &&
      <S.Button command='global:update'>
        <DownloadIcon/>
        <span>Download update</span>
      </S.Button>
    }
    <S.Button command='global:settings'>
      <SettingsIcon/>
      <span>Settings</span>
    </S.Button>
  </>;
};

export default SidebarContent;
