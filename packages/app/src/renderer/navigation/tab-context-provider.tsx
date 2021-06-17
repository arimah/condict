import {ReactNode, useContext, useCallback} from 'react';

import {
  OpenFirstPanelContext,
  OpenPanelContext,
  UpdateFreeTabContext,
  UpdateTabContext,
} from './context';
import {Tab, UpdateTabFn, OpenPanelFn, PanelParams} from './types';

export type Props = {
  tab: Tab;
  children: ReactNode;
};

const TabContextProvider = (props: Props): JSX.Element => {
  const {tab, children} = props;

  const updateFreeTab = useContext(UpdateFreeTabContext);
  const openFirstPanel = useContext(OpenFirstPanelContext);

  const ownerId = tab.id;

  const updateTab = useCallback<UpdateTabFn>(values => {
    updateFreeTab(ownerId, values);
  }, [ownerId, updateFreeTab]);

  const openPanel = useCallback<OpenPanelFn>(function<R>(
    params: PanelParams<R>
  ): Promise<R> {
    return openFirstPanel(ownerId, params);
  }, [ownerId, openFirstPanel]);

  return (
    <UpdateTabContext.Provider value={updateTab}>
      <OpenPanelContext.Provider value={openPanel}>
        {children}
      </OpenPanelContext.Provider>
    </UpdateTabContext.Provider>
  );
};

export default TabContextProvider;
