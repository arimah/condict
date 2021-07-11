import {
  MouseEvent,
  KeyboardEvent,
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';

import {
  Shortcut,
  ShortcutMap,
  WritingDirection,
  useWritingDirection,
} from '@condict/ui';

import {NavigationContextValue, useNavigation} from '../../../navigation';
import {VerticalTabPrevKey, VerticalTabNextKey} from '../../../shortcuts';

import Tab from './tab';
import * as S from './styles';

export type Props = {
  sidebarContainsFocus: () => boolean;
};

interface KeyCommand {
  key: Shortcut | null;
  exec(nav: NavigationContextValue): void;
}

const getKeyboardMap = (dir: WritingDirection) => new ShortcutMap<KeyCommand>(
  // Ctrl+Tab and Ctrl+Shift+Tab are handled globally, so are not present here.
  [
    {
      key: VerticalTabPrevKey[dir],
      exec: nav => nav.selectRelative('prev'),
    },
    {
      key: VerticalTabNextKey[dir],
      exec: nav => nav.selectRelative('next'),
    },
    {
      key: Shortcut.parse('Delete'),
      exec: nav => nav.close(),
    },
  ],
  cmd => cmd.key
);

const TabList = (props: Props): JSX.Element => {
  const {sidebarContainsFocus} = props;

  const nav = useNavigation();
  const dir = useWritingDirection();

  const [hasFocus, setHasFocus] = useState(false);
  const currentTabRef = useRef<HTMLDivElement>(null);

  const keyboardMap = useMemo(() => getKeyboardMap(dir), [dir]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const cmd = keyboardMap.get(e);
    if (cmd) {
      e.preventDefault();
      cmd.exec(nav);
    }
  }, [nav, keyboardMap]);

  const handleTabMouseDown = useCallback((e: MouseEvent) => {
    // If the sidebar currently contains the focus, we can move it safely to
    // the tab list, as we effectively "own" it. But if focus is inside the
    // main area, let it stay there, so the user doesn't have to tab back into
    // the newly opened tab.
    if (!sidebarContainsFocus()) {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    // If the current tab changes while focus is inside the tab list,
    // move focus to the new active tab.
    if (hasFocus) {
      currentTabRef.current?.focus();
    }
  }, [hasFocus, nav.currentTabIndex]);

  return (
    <S.TabList
      onFocus={() => setHasFocus(true)}
      onBlur={() => setHasFocus(false)}
      onKeyDown={handleKeyDown}
    >
      {nav.tabs.map((tab, i) =>
        <Tab
          key={tab.id}
          tab={tab}
          isCurrent={i === nav.currentTabIndex}
          onSelect={nav.select}
          onClose={nav.close}
          onMouseDown={handleTabMouseDown}
          ref={i === nav.currentTabIndex ? currentTabRef : undefined}
        />
      )}
    </S.TabList>
  );
};

export default TabList;
