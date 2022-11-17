import {
  KeyboardEvent,
  SetStateAction,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import {Localized} from '@fluent/react';

import {Shortcut, useWritingDirection} from '@condict/ui';

import {VerticalTabPrevKey, VerticalTabNextKey} from '../../shortcuts';

import AllSections from './sections';
import * as S from './styles';

const SelectTabKey = Shortcut.parse('Space Enter');

export type Props = {
  dialogId: string;
  currentIndex: number;
  onTrySetCurrentIndex: (nextIndex: SetStateAction<number>) => void;
};

const TabList = (props: Props): JSX.Element => {
  const {dialogId, currentIndex, onTrySetCurrentIndex} = props;

  const dir = useWritingDirection();

  const handleTabListKeyDown = useCallback((e: KeyboardEvent) => {
    const delta =
      Shortcut.matches(VerticalTabPrevKey[dir], e)
        ? -1
        : Shortcut.matches(VerticalTabNextKey[dir], e)
          ? 1
          : 0;
    if (delta !== 0) {
      e.preventDefault();
      onTrySetCurrentIndex(index =>
        (index + delta + AllSections.length) % AllSections.length
      );
    }
  }, [onTrySetCurrentIndex, dir]);

  const handleTabClick = useCallback((index: number) => {
    onTrySetCurrentIndex(index);
  }, [onTrySetCurrentIndex]);

  const handleTabKeyDown = useCallback((e: KeyboardEvent, index: number) => {
    if (Shortcut.matches(SelectTabKey, e)) {
      e.preventDefault();
      onTrySetCurrentIndex(index);
    }
  }, [onTrySetCurrentIndex]);

  const tabListRef = useRef<HTMLDivElement>(null);
  const currentTabRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // If the current tab changes while the tab list contains focus, move focus
    // to the newly selected tab.
    if (tabListRef.current?.contains(document.activeElement)) {
      currentTabRef.current?.focus();
    }
  }, [currentIndex]);

  return (
    <S.TabList
      onKeyDown={handleTabListKeyDown}
      ref={tabListRef}
    >
      {AllSections.map(({key, icon}, i) =>
        <S.Tab
          key={key}
          id={`${dialogId}-tab-${key}`}
          aria-selected={i === currentIndex}
          aria-controls={`${dialogId}-tabpanel-${key}`}
          $isCurrent={i === currentIndex}
          tabIndex={i === currentIndex ? 0 : -1}
          onClick={() => handleTabClick(i)}
          onKeyDown={e => handleTabKeyDown(e, i)}
          ref={i === currentIndex ? currentTabRef : undefined}
        >
          {icon}
          <Localized id={`settings-section-${key}`}/>
        </S.Tab>
      )}
    </S.TabList>
  );
};

export default TabList;
