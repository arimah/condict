import React, {
  FocusEvent,
  Ref,
  useCallback,
  useRef,
  useImperativeHandle,
} from 'react';
import BackArrow from 'mdi-react/ArrowLeftIcon';
import {useLocalization} from '@fluent/react';

import {FocusScope, getTabReachable} from '@condict/ui';

import PageContent from '../../../pages';
import {Tab, TabContextProvider} from '../../../navigation';
import {ErrorBoundary} from '../../../ui';

import SidePanelList, {SidePanelListHandle} from '../side-panel-list';

import ErrorPanel from './error-panel';
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
  const sidePanelListRef = useRef<SidePanelListHandle>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const handleFocus = useCallback((e: FocusEvent) => {
    lastFocus.current = e.target as HTMLElement;
  }, []);

  const hasSidePanels = tab.panels.length > 0;
  const restoreFocus = useCallback(() => {
    // If there is an active side panel, we must move focus to it. We should
    // never attempt to move focus into the main panel.
    if (hasSidePanels) {
      sidePanelListRef.current?.restoreFocus();
      return;
    }

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
      const focusable = getTabReachable(mainColumnRef.current, {
        includeRoot: false,
      });
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
  }, [hasSidePanels]);

  useImperativeHandle(ref, () => ({restoreFocus}), [restoreFocus]);

  return (
    <TabContextProvider tab={tab}>
      <FocusScope active={isCurrent && tab.panels.length === 0}>
        <S.TabPanel
          id={`tabpanel-${id}`}
          aria-labelledby={`tab-${id}-title`}
          aria-expanded={isCurrent}
          hidden={!isCurrent}
          $isCurrent={isCurrent}
          onFocus={handleFocus}
          ref={panelRef}
        >
          <ErrorBoundary
            renderError={(error, reload) =>
              <ErrorPanel error={error} onReload={reload} ref={mainColumnRef}/>
            }
          >
            <S.BackButtonColumn>
              {tab.previous && (
                <S.BackButton
                  aria-label={l10n.getString('tab-back-button')}
                  title={l10n.getString('tab-back-button-tooltip', {
                    previousPageTitle: tab.previous.title,
                  })}
                  onClick={() => onBack(id)}
                  ref={backButtonRef}
                >
                  <BackArrow className='rtl-mirror'/>
                </S.BackButton>
              )}
            </S.BackButtonColumn>
            <S.MainColumn ref={mainColumnRef}>
              <PageContent page={page} pageRef={panelRef}/>
            </S.MainColumn>
          </ErrorBoundary>
        </S.TabPanel>
      </FocusScope>
      {tab.state !== 'crashed' &&
        <SidePanelList
          panels={tab.panels}
          visible={isCurrent}
          ref={sidePanelListRef}
        />}
    </TabContextProvider>
  );
});

TabPanel.displayName = 'TabPanel';

export default TabPanel;
