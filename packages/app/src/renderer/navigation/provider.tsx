import {
  ReactNode,
  useReducer,
  useMemo,
  useCallback,
  useRef,
  Dispatch,
} from 'react';
import produce, {Draft} from 'immer';
import {useLocalization} from '@fluent/react';
import {customAlphabet} from 'nanoid';

import {Page, HomePage} from '../pages';
import {OpenDialogFn, useOpenDialog} from '../dialog-stack';

import {
  NavigationContext,
  NavigateToContext,
  UpdateFreeTabContext,
  OpenPanelContext,
  OpenFirstPanelContext,
} from './context';
import PageConditions, {SingletonPage} from './page-conditions';
import ConfirmCloseDialog from './confirm-close-dialog';
import {
  NavigateOptions,
  NavigationContextValue,
  Tab,
  Panel,
  PanelParams,
  PanelProps,
  UpdateFreeTabFn,
  OpenPanelFn,
  OpenFirstPanelFn,
} from './types';

export type Props = {
  children: ReactNode;
};

type State = {
  tabs: readonly Tab[];
  currentTabIndex: number;
};

type Message =
  | {type: 'select'; index: number | 'prev' | 'next'}
  | {type: 'open'; tabs: Tab[]; insertIndex: number; background: boolean}
  | {type: 'navigate'; index: number; page: Page; title: string}
  | {type: 'update', index: number; title?: string; dirty?: boolean}
  | {type: 'back'; index: number}
  | {type: 'close'; startIndex: number; endIndex: number}
  | {
    type: 'openPanel';
    tabIndex: number;
    panelIndex: number;
    panel: Panel;
    reject: (reason: any) => void;
  }
  | {
    type: 'updatePanel';
    tabId: string;
    panelId: string;
    title?: string;
    dirty?: boolean;
  }
  | {
    type: 'closePanel',
    tabId: string;
    panelId: string;
    resolve: () => void;
  };

interface CloseRange {
  /** The index of the first tab to be closed. */
  startIndex: number;
  /** The exclusive index of the last tab to be closed. */
  endIndex: number;
  /**
   * If true, there is at least one tab with unsaved changes about to be closed.
   */
  hasDirty: boolean;
}

const genId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

const NavigationProvider = (props: Props): JSX.Element => {
  const {children} = props;

  const {l10n} = useLocalization();
  const openDialog = useOpenDialog();

  const [state, dispatch] = useReducer(reduce, null, getInitialState);

  const stateRef = useRef(state);
  stateRef.current = state;

  const functions = useMemo(() => ({
    navigateTo: (
      page: Page,
      {
        openInNewTab = false,
        openInBackground = false,
      }: NavigateOptions = {}
    ): void => {
      const state = stateRef.current;

      // If we've been asked to open a singleton page, we must switch to the
      // existing tab if there is one.
      if (PageConditions.isSingleton(page)) {
        const index = findExistingTab(state.tabs, page);
        if (index !== -1) {
          // There is an existing tab for this resource. Switch to it unless the
          // user has asked to open it in the background.
          if (!openInBackground) {
            dispatch({type: 'select', index});
          }
          return;
        }
      }

      // Let's see if we should navigate inside the current tab.
      const currentTab = state.tabs[state.currentTabIndex];
      const shouldNavigateWithinCurrent =
        !openInNewTab &&
        Tab.canNavigateWithin(currentTab) &&
        !PageConditions.alwaysOpenInNewTab(page);
      if (shouldNavigateWithinCurrent) {
        const message: Message = {
          type: 'navigate',
          index: state.currentTabIndex,
          page,
          title: Page.getInitialTitle(page),
        };

        if (Tab.isDirty(currentTab)) {
          const index = state.currentTabIndex;
          void confirmClose(
            openDialog,
            state.tabs,
            index,
            index + 1,
            dispatch
          ).then(canClose => {
            if (canClose) {
              dispatch(message);
            }
          });
        } else {
          dispatch(message);
        }
        return;
      }

      // At this point, we need to open at least one new tab. If the page is
      // the child of a language, we must ensure the language is open too.
      let insertIndex = state.tabs.length;
      const newTabs = [
        Tab.fromPage(genId(), page),
      ];
      if (Page.isLanguageChild(page)) {
        const parentIndex = findExistingTab(state.tabs, page.language);
        if (parentIndex === -1) {
          newTabs.unshift(Tab.fromPage(genId(), page.language));
        } else {
          insertIndex = findChildInsertIndex(state.tabs, parentIndex);
        }
      }

      dispatch({
        type: 'open',
        tabs: newTabs,
        insertIndex,
        background: openInBackground,
      });
    },
    select: (id: string): void => {
      const index = stateRef.current.tabs.findIndex(t => t.id === id);
      if (index !== -1) {
        dispatch({type: 'select', index});
      }
    },
    selectRelative: (direction: 'prev' | 'next'): void => {
      dispatch({type: 'select', index: direction});
    },
    back: (id?: string): void => {
      const state = stateRef.current;

      const index = id === undefined
        ? state.currentTabIndex
        : state.tabs.findIndex(t => t.id === id);
      if (index !== -1) {
        const tab = state.tabs[index];
        if (tab.panels.length > 0) {
          // Can't navigate within a tab with one or more panels open.
          return;
        }

        if (Tab.isDirty(tab)) {
          void confirmClose(
            openDialog,
            state.tabs,
            index,
            index + 1,
            dispatch
          ).then(canClose => {
            if (canClose) {
              dispatch({type: 'back', index});
            }
          });
        } else {
          dispatch({type: 'back', index});
        }
      }
    },
    close: (id?: string): void => {
      const state = stateRef.current;
      const index = id === undefined
        ? state.currentTabIndex
        : state.tabs.findIndex(t => t.id === id);
      if (index === -1 || !Tab.canClose(state.tabs[index])) {
        return;
      }

      const {
        startIndex,
        endIndex,
        hasDirty,
      } = findCloseRange(state.tabs, index);

      const message: Message = {
        type: 'close',
        startIndex,
        endIndex,
      };
      if (hasDirty) {
        void confirmClose(
          openDialog,
          state.tabs,
          startIndex,
          endIndex,
          dispatch
        ).then(canClose => {
          if (canClose) {
            dispatch(message);
          }
        });
      } else {
        dispatch(message);
      }
    },
    move: (_id: string): void => {
      // TODO: Complex logic here
    },
  } as const), [l10n, openDialog]);

  const value = useMemo<NavigationContextValue>(() => ({
    ...state,
    ...functions,
  }), [state, functions]);

  const updateFreeTab = useCallback<UpdateFreeTabFn>((id, {title, dirty}) => {
    const state = stateRef.current;
    const index = state.tabs.findIndex(t => t.id === id);
    if (index !== -1) {
      dispatch({type: 'update', index, title, dirty});
    }
  }, []);

  const openFirstPanel = useMemo<OpenFirstPanelFn>(() => {
    const openPanel = function<R>(
      tabId: string,
      panelIndex: number,
      params: PanelParams<R>
    ): Promise<R>  {
      const state = stateRef.current;
      const tabIndex = state.tabs.findIndex(t => t.id === tabId);

      if (tabIndex === -1) {
        return Promise.reject(new Error(`Tab not found: ${tabId}`));
      }

      const tab = state.tabs[tabIndex];
      if (tab.panels.length > panelIndex) {
        const message = panelIndex === 0
          ? `Tab ${tabId} already has a open panel`
          : `Tab ${tabId} panel ${panelIndex - 1} already has an open panel`;
        return Promise.reject(new Error(message));
      }

      return new Promise<R>((resolve, reject) => {
        const panelId = genId();
        const {render} = params;
        const renderProps: PanelProps<R> = {
          updatePanel: ({title, dirty}) => dispatch({
            type: 'updatePanel',
            tabId,
            panelId,
            title,
            dirty,
          }),
          onResolve: value => dispatch({
            type: 'closePanel',
            tabId,
            panelId,
            resolve: () => resolve(value),
          }),
        };

        const openNestedPanel: OpenPanelFn = params =>
          openPanel(tabId, panelIndex + 1, params);

        dispatch({
          type: 'openPanel',
          tabIndex,
          panelIndex,
          panel: {
            id: panelId,
            title: params.initialTitle,
            dirty: false,
            // eslint-disable-next-line react/display-name
            render: () =>
              <OpenPanelContext.Provider value={openNestedPanel}>
                {render(renderProps)}
              </OpenPanelContext.Provider>,
          },
          reject,
        });
      });
    };

    return function<R>(tabId: string, params: PanelParams<R>): Promise<R> {
      return openPanel(tabId, 0, params);
    };
  }, []);

  return (
    <NavigationContext.Provider value={value}>
      <NavigateToContext.Provider value={functions.navigateTo}>
        <UpdateFreeTabContext.Provider value={updateFreeTab}>
          <OpenFirstPanelContext.Provider value={openFirstPanel}>
            {children}
          </OpenFirstPanelContext.Provider>
        </UpdateFreeTabContext.Provider>
      </NavigateToContext.Provider>
    </NavigationContext.Provider>
  );
};

export default NavigationProvider;

const getInitialState = (): State => ({
  tabs: [Tab.fromPage('home', HomePage)],
  currentTabIndex: 0,
});

const reduce = produce<State, [Message]>((state, message) => {
  switch (message.type) {
    case 'select': {
      const {index} = message;
      switch (index) {
        case 'prev':
          if (state.currentTabIndex > 0) {
            state.currentTabIndex--;
          }
          break;
        case 'next':
          if (state.currentTabIndex < state.tabs.length - 1) {
            state.currentTabIndex++;
          }
          break;
        default:
          state.currentTabIndex = index;
          break;
      }
      break;
    }
    case 'open': {
      const {tabs, insertIndex, background} = message;
      state.tabs.splice(insertIndex, 0, ...tabs as Draft<Tab>[]);
      if (!background) {
        // Focus the last of the created tabs.
        state.currentTabIndex = insertIndex + tabs.length - 1;
      } else if (state.currentTabIndex >= insertIndex) {
        // Offset the current tab index to account for the newly created tabs.
        state.currentTabIndex += tabs.length;
      }
      break;
    }
    case 'navigate': {
      const {index, page, title} = message;
      const tab = state.tabs[index];
      tab.previous = {
        page: tab.page,
        title: tab.title,
        state: tab.state,
        previous: tab.previous,
      };
      tab.page = page;
      tab.title = title;
      tab.state = title === '' ? 'loading' : 'idle';
      tab.dirty = false;
      tab.panels = [];
      break;
    }
    case 'update': {
      const {index, title, dirty} = message;
      const tab = state.tabs[index];
      if (title !== undefined) {
        tab.title = title;
      }
      if (dirty !== undefined) {
        tab.dirty = dirty;
      }
      break;
    }
    case 'back': {
      const {index} = message;
      const tab = state.tabs[index];
      if (tab.previous) {
        Object.assign(state.tabs[index], tab.previous);
        tab.dirty = false;
      }
      break;
    }
    case 'close': {
      const {startIndex, endIndex} = message;
      state.tabs.splice(startIndex, endIndex - startIndex);

      if (state.currentTabIndex >= endIndex) {
        // Try to keep the current tab selected.
        const closedCount = endIndex - startIndex;
        state.currentTabIndex -= closedCount;
      }

      if (state.currentTabIndex >= state.tabs.length) {
        state.currentTabIndex = state.tabs.length - 1;
      }
      break;
    }
    case 'openPanel': {
      const {tabIndex, panelIndex, panel, reject} = message;
      const tab = state.tabs[tabIndex];
      if (tab && tab.panels.length === panelIndex) {
        tab.panels.push(panel);
      } else {
        reject(new Error('Panel could not be opened'));
      }
      break;
    }
    case 'updatePanel': {
      const {tabId, panelId, title, dirty} = message;
      const tab = state.tabs.find(t => t.id === tabId);
      const panel = tab && tab.panels.find(p => p.id === panelId);
      if (panel) {
        if (title !== undefined) {
          panel.title = title;
        }
        if (dirty !== undefined) {
          panel.dirty = dirty;
        }
      }
      break;
    }
    case 'closePanel': {
      const {tabId, panelId, resolve} = message;
      const tab = state.tabs.find(t => t.id === tabId);
      if (
        tab &&
        tab.panels.length > 0 &&
        tab.panels[tab.panels.length - 1].id === panelId
      ) {
        tab.panels.pop();
        resolve();
      }
      break;
    }
  }
  return state;
});

const findExistingTab = (
  tabs: readonly Tab[],
  page: SingletonPage
): number => {
  return tabs.findIndex(t => PageConditions.areSameResource(page, t.page));
};

const findChildInsertIndex = (
  tabs: readonly Tab[],
  parentIndex: number
): number => {
  for (let i = parentIndex + 1; i < tabs.length; i++) {
    if (!Tab.isChild(tabs[i])) {
      return i;
    }
  }
  return tabs.length;
};

const findCloseRange = (
  tabs: readonly Tab[],
  startIndex: number
): CloseRange => {
  const startTab = tabs[startIndex];
  if (Tab.canHaveChildren(startTab)) {
    // When the parent closes, all children under it must close too.
    let hasDirty = Tab.isDirty(startTab);
    let i: number;
    for (i = startIndex + 1; i < tabs.length; i++) {
      const tab = tabs[i];
      if (!Tab.isChild(tab)) {
        break;
      }
      hasDirty = hasDirty || Tab.isDirty(tab);
    }

    return {
      startIndex,
      endIndex: i,
      hasDirty,
    };
  } else {
    return {
      startIndex,
      endIndex: startIndex + 1,
      hasDirty: Tab.isDirty(startTab),
    };
  }
};

const confirmClose = async (
  openDialog: OpenDialogFn,
  tabs: readonly Tab[],
  startIndex: number,
  endIndex: number,
  dispatch: Dispatch<Message>
): Promise<boolean> => {
  for (let i = startIndex; i < endIndex; i++) {
    const tab = tabs[i];
    if (!Tab.isDirty(tab)) {
      continue;
    }

    // First, move to the tab so the user can see what's being confirmed.
    dispatch({type: 'select', index: i});

    // Wait one tick for the UI to update. This allows focus to move into the
    // tab, so it can be restored correctly when the dialog is closed.
    await Promise.resolve();

    const response = await openDialog(ConfirmCloseDialog);
    if (response === 'stay') {
      // If the user does not wish to discard their unsaved changes, do *not*
      // restore the previous tab. Continue right here, so the user can have a
      // closer look at their unsaved work.
      return false;
    }
  }
  return true;
};
