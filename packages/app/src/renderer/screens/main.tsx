import {KeyboardEvent, useCallback, useRef} from 'react';

import {CommandProvider, CommandGroup, useCommandGroup} from '@condict/ui';

import {SidebarContent, TabPanelList} from '../ui';
import {useNavigationCommands, useNavigateTo} from '../navigation';
import {useOpenDialog} from '../dialog-stack';
import {searchDialog} from '../dialogs';

import * as S from './styles';

const MainScreen = (): JSX.Element => {
  const navigateTo = useNavigateTo();
  const navCommands = useNavigationCommands();

  const openDialog = useOpenDialog();
  const appCommands = useCommandGroup<() => void>({
    commands: {
      'global:search': {
        action: () => {
          openDialog(searchDialog).then(
            page => {
              if (page) {
                navigateTo(page, {openInNewTab: true});
              }
            },
            () => {/* ignore */}
          );
        },
      },
    },
    exec: cmd => cmd(),
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
};

export default MainScreen;
