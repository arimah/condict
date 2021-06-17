import React, {useContext} from 'react';

import {
  NavigateFn,
  NavigationContextValue,
  UpdateTabFn,
  UpdateFreeTabFn,
  OpenPanelFn,
  OpenFirstPanelFn,
} from './types';

const noContext = (): never => {
  throw new Error('No context available');
};

export const NavigationContext = React.createContext<NavigationContextValue>({
  tabs: [],
  currentTabIndex: -1,
  navigateTo: noContext,
  select: noContext,
  selectRelative: noContext,
  back: noContext,
  close: noContext,
  move: noContext,
});

export const useNavigation = (): NavigationContextValue =>
  useContext(NavigationContext);

export const NavigateToContext = React.createContext<NavigateFn>(noContext);

export const useNavigateTo = (): NavigateFn => useContext(NavigateToContext);

export const UpdateFreeTabContext = React.createContext<UpdateFreeTabFn>(noContext);

export const UpdateTabContext = React.createContext<UpdateTabFn>(noContext);

export const useUpdateTab = (): UpdateTabFn => useContext(UpdateTabContext);

export const OpenFirstPanelContext = React.createContext<OpenFirstPanelFn>(noContext);

export const OpenPanelContext = React.createContext<OpenPanelFn>(noContext);

export const useOpenPanel = (): OpenPanelFn => useContext(OpenPanelContext);
