import {useEffect, useRef} from 'react';

import {useNavigation} from '../../navigation';

import TabPanel, {TabPanelHandle} from './tab-panel';

export type Props = {
  mainContentContainsFocus: () => boolean;
};

const TabPanelList = (props: Props): JSX.Element => {
  const {mainContentContainsFocus} = props;

  const nav = useNavigation();

  const currentPanelRef = useRef<TabPanelHandle>(null);

  const currentPage = nav.tabs[nav.currentTabIndex].page;

  useEffect(() => {
    const currentPanel = currentPanelRef.current;
    if (!currentPanel) {
      return;
    }

    // We will attempt to set focus to something inside the panel under the
    // following two circumstances:
    //
    //   1. The active element is null or body, in which case the focus is
    //      effectively unowned;
    //   2. The active element is inside the main content area, in which case
    //      we own the focus and can do with it as we please.
    //
    // The latter happens when switching tabs. For some reason, focus briefly
    // stays on the last focus inside the previous tab, even though the element
    // is no longer visible.
    if (
      document.activeElement === null ||
      document.activeElement === document.body ||
      mainContentContainsFocus()
    ) {
      currentPanel.restoreFocus();
    }
  }, [currentPage]);

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