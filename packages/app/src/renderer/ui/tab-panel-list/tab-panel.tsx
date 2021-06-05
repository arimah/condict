import React, {
  FocusEvent,
  Ref,
  useCallback,
  useRef,
  useImperativeHandle,
} from 'react';
import BackArrow from 'mdi-react/ArrowLeftIcon';
import {useLocalization} from '@fluent/react';

import {getFocusable} from '@condict/ui';

import {PageContent} from '../../pages';
import {Tab} from '../../navigation';

import * as S from './styles';

export type Props = {
  tab: Tab;
  isCurrent: boolean;
  onBack: (id: string) => void;
};

export interface TabPanelHandle {
  /** Restores keyboard focus to the tab panel. */
  restoreFocus(): void;
}

const TabPanel = React.forwardRef((
  props: Props,
  ref: Ref<TabPanelHandle>
): JSX.Element => {
  const {tab, isCurrent, onBack} = props;

  const {l10n} = useLocalization();

  const {id, page} = tab;

  const panelRef = useRef<HTMLDivElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const mainColumnRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const handleFocus = useCallback((e: FocusEvent) => {
    lastFocus.current = e.target as HTMLElement;
  }, []);

  useImperativeHandle(ref, () => ({
    restoreFocus() {
      const panel = panelRef.current;
      if (!panel) {
        return;
      }

      // Try to focus lastFocus, if the element is still valid. It might have
      // become invalid if the panel was updated while focus was outside it,
      // in which case we'll have a reference to a removed element.
      if (lastFocus.current && panel.contains(lastFocus.current)) {
        lastFocus.current.focus();
        return;
      }

      // If lastFocus was not valid, try to find the first focusable element in
      // the main column.
      if (mainColumnRef.current) {
        const focusable = getFocusable(mainColumnRef.current, {includeRoot: false});
        if (focusable.length > 0) {
          (focusable[0] as HTMLElement).focus();
          return;
        }
      }

      // Nothing focusable inside the main column, so let's try the back button.
      if (backButtonRef.current) {
        backButtonRef.current.focus();
        return;
      }

      // If all else fails, focus the panel itself.
      panel.focus();
    },
  }), []);

  return (
    <S.TabPanel
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      aria-expanded={isCurrent}
      hidden={!isCurrent}
      isCurrent={isCurrent}
      onFocus={handleFocus}
      ref={panelRef}
    >
      <S.BackButtonColumn>
        {tab.previous && (
          <S.BackButton
            label={l10n.getString('tab-back-button')}
            title={l10n.getString('tab-back-button-tooltip', {
              previousPageTitle: tab.previous.title,
            })}
            onClick={() => onBack(id)}
            ref={backButtonRef}
          >
            <BackArrow/>
          </S.BackButton>
        )}
      </S.BackButtonColumn>
      <S.MainColumn ref={mainColumnRef}>
        <PageContent page={page}/>
      </S.MainColumn>
    </S.TabPanel>
  );
});

TabPanel.displayName = 'TabPanel';

export default TabPanel;
