import React, {KeyboardEvent, useCallback, useRef} from 'react';

import {
  CommandProvider,
  CommandGroup,
  CommandSpecMap,
  useCommandGroup,
} from '@condict/ui';

import {useNavigationCommands, useNavigateTo} from '../../navigation';
import {useOpenDialog} from '../../dialog-stack';
import {searchDialog, settingsDialog} from '../../dialogs';

import SidebarContent from './sidebar-content';
import TabPanelList from './tab-panel-list';
import * as S from './styles';

type AppCommand = 'search' | 'settings';

const AppCommandMap: CommandSpecMap<AppCommand> = {
  'global:search': {
    action: 'search',
  },
  'global:settings': {
    action: 'settings',
  },
};

const MainScreen = React.memo((): JSX.Element => {
  const navigateTo = useNavigateTo();
  const navCommands = useNavigationCommands();

  const openDialog = useOpenDialog();
  const appCommands = useCommandGroup({
    commands: AppCommandMap,
    exec: action => {
      switch (action) {
        case 'search':
          openDialog(searchDialog).then(
            page => {
              if (page) {
                navigateTo(page, {openInNewTab: true});
              }
            },
            () => { /* ignore */ }
          );
          break;
        case 'settings':
          openDialog(settingsDialog).catch(() => { /* ignore */ });
          break;
      }
    },
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!CommandGroup.handleKey(navCommands, e)) {
      CommandGroup.handleKey(appCommands, e);
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
      <CommandProvider commands={appCommands}>
        <S.MainScreen onKeyDown={handleKeyDown}>
          <S.Sidebar ref={sidebarRef}>
            <SidebarContent sidebarContainsFocus={sidebarContainsFocus}/>
          </S.Sidebar>
          <S.MainContent ref={mainRef}>
            <TabPanelList mainContentContainsFocus={mainContentContainsFocus}/>
          </S.MainContent>
        </S.MainScreen>
      </CommandProvider>
    </CommandProvider>
  );
});

MainScreen.displayName = 'MainScreen';

export default MainScreen;
