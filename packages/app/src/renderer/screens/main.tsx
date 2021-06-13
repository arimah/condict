import {KeyboardEvent, useCallback, useRef} from 'react';

import {CommandProvider} from '@condict/ui';

import {SidebarContent, TabPanelList} from '../ui';
import {useNavigationCommands} from '../navigation';

import * as S from './styles';

const MainScreen = (): JSX.Element => {
  const navCommands = useNavigationCommands();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const cmd = navCommands.keyMap.get(e);
    if (cmd && !cmd.disabled) {
      e.preventDefault();
      cmd.exec();
    }
  }, [navCommands]);

  const mainRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  const mainContentContainsFocus = useCallback(() => {
    if (!mainRef.current) {
      return false;
    }
    return mainRef.current.contains(document.activeElement);
  }, []);

  const sidebarContainsFocus = useCallback(() => {
    if (!sidebarRef.current) {
      return false;
    }
    return sidebarRef.current.contains(document.activeElement);
  }, []);

  return (
    <CommandProvider commands={navCommands}>
      <S.MainScreen onKeyDown={handleKeyDown}>
        <S.Sidebar ref={sidebarRef}>
          <SidebarContent sidebarContainsFocus={sidebarContainsFocus}/>
        </S.Sidebar>
        <S.MainContent ref={mainRef}>
          <TabPanelList mainContentContainsFocus={mainContentContainsFocus}/>
        </S.MainContent>
      </S.MainScreen>
    </CommandProvider>
  );
};

export default MainScreen;
