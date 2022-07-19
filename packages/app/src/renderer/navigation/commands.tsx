import {CommandGroup, CommandSpecMap, useCommandGroup} from '@condict/ui';

import {useNavigation} from './context';
import Shortcuts from './shortcuts';

type NavigationAction =
  | 'prevTab'
  | 'nextTab'
  | 'back'
  | 'closeTab';

const NavigationCommands: CommandSpecMap<NavigationAction> = {
  'nav:prevTab': {
    action: 'prevTab',
    shortcut: Shortcuts.prevTab,
  },
  'nav:nextTab': {
    action: 'nextTab',
    shortcut: Shortcuts.nextTab,
  },
  'nav:back': {
    action: 'back',
    shortcut: Shortcuts.back,
  },
  'nav:closeTab': {
    action: 'closeTab',
    shortcut: Shortcuts.closeTab,
  },
};

const useNavigationCommands = (): CommandGroup => {
  const nav = useNavigation();
  return useCommandGroup({
    commands: NavigationCommands,
    exec: action => {
      switch (action) {
        case 'prevTab':
          nav.selectRelative('prev');
          break;
        case 'nextTab':
          nav.selectRelative('next');
          break;
        case 'back':
          nav.back();
          break;
        case 'closeTab':
          nav.close();
          break;
      }
    },
  });
};

export default useNavigationCommands;
