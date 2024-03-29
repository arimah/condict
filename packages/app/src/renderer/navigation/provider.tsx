import {
  ReactNode,
  Dispatch,
  useReducer,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import produce, {Draft} from 'immer';
import {useLocalization} from '@fluent/react';
import {customAlphabet} from 'nanoid';

import {SavedSession, SavedTab, SavedPreviousTab} from '../../types';

import {Page, HomePage} from '../page';
import {OpenDialogFn, useOpenDialog} from '../dialog-stack';
import ipc from '../ipc';

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
  PreviousTab,
  UpdateFreeTabFn,
  OpenPanelFn,
  OpenFirstPanelFn,
} from './types';

export type Props = {
  lastSession: SavedSession | null;
  children: ReactNode;
};

type State = {
  tabs: readonly Tab[];
  currentTabIndex: number;
  prevTabId: string | null;
};

type Message =
  | {type: 'select'; index: number | 'prev' | 'next'; keepPrev?: boolean}
  | {type: 'open'; tabs: Tab[]; insertIndex: number; background: boolean}
  | {
    type: 'navigate';
    index: number;
    page: Page;
    title: string;
    replace: boolean;
  }
  | {
    type: 'update';
    index: number;
    title?: string;
    dirty?: boolean;
    crashed?: boolean;
  }
  | {type: 'back'; index: number}
  | {
    type: 'close';
    /**
     * The previously current tab index; that is, the index of the tab that was
     * current when the user initiated the close action. When this message is
     * dispatched, the current index might be something different, if a close
     * confirmation dialog has popped up.
     */
    fromIndex: number;
    startIndex: number;
    endIndex: number;
  }
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
  const {lastSession, children} = props;

  const {l10n} = useLocalization();
  const openDialog = useOpenDialog();

  const [state, dispatch] = useReducer(reduce, lastSession, getInitialState);

  const stateRef = useRef(state);
  stateRef.current = state;

  const functions = useMemo(() => ({
    navigateTo: (
      page: Page,
      {
        openInNewTab = false,
        openInBackground = false,
        replace = false,
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
        !PageConditions.alwaysOpenInNewTab(page) && (
          replace
            ? Tab.canReplace(currentTab, page)
            : (
              Tab.canNavigateWithin(currentTab, page) &&
              !openInNewTab
            )
        );
      if (shouldNavigateWithinCurrent) {
        const message: Message = {
          type: 'navigate',
          index: state.currentTabIndex,
          page,
          title: Page.getInitialTitle(page),
          replace,
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
        fromIndex: state.currentTabIndex,
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

  const updateFreeTab = useCallback<UpdateFreeTabFn>((
    id,
    {title, dirty, crashed}
  ) => {
    const state = stateRef.current;
    const index = state.tabs.findIndex(t => t.id === id);
    if (index !== -1) {
      dispatch({type: 'update', index, title, dirty, crashed});
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
        type StaticProps = Omit<
          PanelProps<R>,
          'titleId' | 'panelRef' | 'entering'
        >;

        const panelId = genId();
        const {render} = params;
        const staticProps: StaticProps = {
          updatePanel: ({dirty}) => dispatch({
            type: 'updatePanel',
            tabId,
            panelId,
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
            dirty: false,
            // eslint-disable-next-line react/display-name
            render: props =>
              <OpenPanelContext.Provider value={openNestedPanel}>
                {render({...staticProps, ...props})}
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

  useEffect(() => {
    void ipc.invoke('update-session', {
      tabs: state.tabs
        .filter(t => t.page.type !== 'home')
        .map(exportTab),
      currentTab: state.tabs[state.currentTabIndex].id,
    });
  }, [state]);

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

const getInitialState = (lastSession: SavedSession | null): State => {
  // The home page is never saved with the session
  const tabs = [Tab.fromPage('home', HomePage)];
  let currentTabIndex = 0;

  if (lastSession) {
    for (const savedTab of lastSession.tabs) {
      const tab = restoreTab(savedTab);
      if (tab) {
        tabs.push(tab);

        if (savedTab.id === lastSession.currentTab) {
          currentTabIndex = tabs.length - 1;
        }
      }
    }
  }

  return {
    tabs,
    currentTabIndex,
    prevTabId: null,
  };
};

const restoreTab = (savedTab: SavedTab): Tab | null => {
  // TODO: Validate saved pages somehow
  const page = savedTab.page as Page;
  if (page.type === 'home') {
    // Only one home page!
    return null;
  }

  return {
    id: genId(),
    page,
    title: savedTab.title,
    dirty: false,
    state: 'loading',
    previous: savedTab.previous && restorePreviousTab(savedTab.previous),
    panels: [],
  };
};

const restorePreviousTab = (savedTab: SavedPreviousTab): PreviousTab => ({
  page: savedTab.page as Page,
  title: savedTab.title,
  state: 'loading',
  previous: savedTab.previous && restorePreviousTab(savedTab.previous),
});

const exportTab = (tab: Tab): SavedTab => ({
  id: tab.id,
  page: tab.page,
  title: tab.title,
  previous: tab.previous && exportPreviousTab(tab.previous),
});

const exportPreviousTab = (tab: PreviousTab): SavedPreviousTab => ({
  page: tab.page,
  title: tab.title,
  previous: tab.previous && exportPreviousTab(tab.previous),
});

const reduce = produce<State, [Message]>((state, message) => {
  switch (message.type) {
    case 'select': {
      const {index, keepPrev} = message;
      let nextIndex = state.currentTabIndex;
      switch (index) {
        case 'prev':
          if (state.currentTabIndex > 0) {
            nextIndex = state.currentTabIndex - 1;
          }
          break;
        case 'next':
          if (state.currentTabIndex < state.tabs.length - 1) {
            nextIndex = state.currentTabIndex + 1;
          }
          break;
        default:
          nextIndex = index;
          break;
      }
      if (state.currentTabIndex !== nextIndex) {
        if (!keepPrev) {
          state.prevTabId = state.tabs[state.currentTabIndex].id;
        }
        state.currentTabIndex = nextIndex;
      }
      break;
    }
    case 'open': {
      const {tabs, insertIndex, background} = message;
      state.tabs.splice(insertIndex, 0, ...tabs as Draft<Tab>[]);
      if (!background) {
        // Focus the last of the created tabs.
        state.prevTabId = state.tabs[state.currentTabIndex].id;
        state.currentTabIndex = insertIndex + tabs.length - 1;
      } else if (state.currentTabIndex >= insertIndex) {
        // Offset the current tab index to account for the newly created tabs.
        state.currentTabIndex += tabs.length;
      }
      break;
    }
    case 'navigate': {
      const {index, page, title, replace} = message;
      const tab = state.tabs[index];
      if (!replace) {
        tab.previous = {
          page: tab.page,
          title: tab.title,
          state: tab.state,
          previous: tab.previous,
        };
      }
      tab.page = page;
      tab.title = title;
      tab.state = title === '' ? 'loading' : 'idle';
      tab.dirty = false;
      tab.panels = [];
      break;
    }
    case 'update': {
      const {index, title, dirty, crashed} = message;
      const tab = state.tabs[index];
      if (title !== undefined) {
        tab.title = title;
      }
      if (dirty !== undefined) {
        tab.dirty = dirty;
      }
      if (crashed !== undefined) {
        if (crashed) {
          tab.panels = [];
          tab.state = 'crashed';
        } else {
          tab.state = tab.title === '' ? 'loading' : 'idle';
        }
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
      const {fromIndex, startIndex, endIndex} = message;
      state.tabs.splice(startIndex, endIndex - startIndex);

      if (startIndex <= fromIndex && fromIndex < endIndex) {
        // The current tab (fromIndex) was closed. If there is a valid
        // `prevTabId`, then use that. Otherwise, select the tab that is
        // now immediately after the closed group (startIndex).
        const prevTabIndex = state.tabs.findIndex(t =>
          t.id === state.prevTabId
        );
        if (prevTabIndex !== -1) {
          state.currentTabIndex = prevTabIndex;
          state.prevTabId = null;
        } else {
          state.currentTabIndex = Math.min(startIndex, state.tabs.length - 1);
        }
      } else {
        // If fromIndex was *not* closed, return to it.
        state.currentTabIndex = Math.min(
          fromIndex >= endIndex
            ? fromIndex - (endIndex - startIndex)
            : fromIndex,
          state.tabs.length - 1
        );
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
      const {tabId, panelId, dirty} = message;
      const tab = state.tabs.find(t => t.id === tabId);
      const panel = tab && tab.panels.find(p => p.id === panelId);
      if (panel) {
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
    dispatch({type: 'select', index: i, keepPrev: true});

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
