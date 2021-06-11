import {ReactNode, useContext, useCallback} from 'react';

import {OpenFirstPanelContext, OpenPanelContext} from './context';
import {Tab, OpenPanelFn, PanelParams} from './types';

export type Props = {
  tab: Tab;
  children: ReactNode;
};

const TabContextProvider = (props: Props): JSX.Element => {
  const {tab, children} = props;

  const openFirstPanel = useContext(OpenFirstPanelContext);

  const ownerId = tab.id;
  const value = useCallback<OpenPanelFn>(function<R>(
    params: PanelParams<R>
  ): Promise<R> {
    return openFirstPanel(ownerId, params);
  }, [ownerId, openFirstPanel]);

  return (
    <OpenPanelContext.Provider value={value}>
      {children}
    </OpenPanelContext.Provider>
  );
};

export default TabContextProvider;
