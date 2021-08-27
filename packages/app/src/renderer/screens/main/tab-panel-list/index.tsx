import {useLayoutEffect, useRef} from 'react';

import {useNavigation} from '../../../navigation';

import TabPanel, {TabPanelHandle} from './tab-panel';

export type Props = {
  mainContentContainsFocus: () => boolean;
};

const TabPanelList = (props: Props): JSX.Element => {
  const {mainContentContainsFocus} = props;

  const nav = useNavigation();

  const currentPanelRef = useRef<TabPanelHandle>(null);

  const currentTab = nav.tabs[nav.currentTabIndex];
  const currentPage = currentTab.page;
  const currentSidePanel =
    currentTab.panels.length > 0
      ? currentTab.panels[currentTab.panels.length - 1].id
      : null;

  const prevTabs = useRef(nav.tabs);
  const isNewTab = !prevTabs.current.some(t => t.id === currentTab.id);
  prevTabs.current = nav.tabs;

  // HACK: useLayoutEffect instead of useEffect prevents us from catching <body>
  // as the active element when clicking sidebar tabs, for some reason.
  useLayoutEffect(() => {
    const currentPanel = currentPanelRef.current;
    if (!currentPanel) {
      return;
    }

    /*
     * We will attempt to set focus to something inside the panel under the
     * following circumstances:
     *
     *   1. The active element is null or body, in which case the focus is
     *      effectively unowned;
     *   2. The active element is inside the main content area, in which case
     *      we own the focus and can do with it as we please.
     *   3. We have just entered a new tab. Navigation typically only occurs
     *      within the main content area, but sometimes we want to open tabs
     *      from dialogs and similar, in which case we should focus that new
     *      content to put the user where they're likely to want to be.
     *
     *      "New tab" means it was absent from the tab list last time this
     *      effect ran.
     *
     * #2 happens when switching tabs. For some reason, focus briefly stays on
     * the last focus inside the previous tab, even though the element is no
     * longer visible.
     */

    if (
      document.activeElement === null ||
      document.activeElement === document.body ||
      mainContentContainsFocus() ||
      isNewTab
    ) {
      currentPanel.restoreFocus();
    }
  }, [currentPage, currentSidePanel]);

  return <>
    {nav.tabs.map((tab, i) =>
      <TabPanel
        key={tab.id}
        tab={tab}
        isCurrent={i === nav.currentTabIndex}
        onBack={nav.back}
        ref={i === nav.currentTabIndex ? currentPanelRef : undefined}
      />
    )}
  </>;
};

export default TabPanelList;
