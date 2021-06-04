import {ReactNode, useReducer, useMemo, useRef, Dispatch} from 'react';
import produce from 'immer';
import {ReactLocalization, useLocalization} from '@fluent/react';
import {customAlphabet} from 'nanoid';

import {Page, HomePage} from '../pages';

import {NavigationContext, NavigateToContext} from './context';
import PageConditions, {SingletonPage} from './page-conditions';
import {NavigateOptions, NavigationContextValue, Tab} from './types';

export type Props = {
  children: ReactNode;
};

type State = {
  tabs: readonly Tab[];
  currentTabIndex: number;
};

type Message =
  | {type: 'select', index: number | 'prev' | 'next'}
  | {type: 'open', tabs: Tab[], insertIndex: number, background: boolean}
  | {type: 'navigate', index: number, page: Page, title: string}
  | {type: 'back', index: number}
  | {type: 'close', startIndex: number, endIndex: number};

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
  const [state, dispatch] = useReducer(reduce, l10n, getInitialState);

  const stateRef = useRef(state);
  stateRef.current = state;

  const functions = useMemo(() => ({
    navigateTo: (
      page: Page,
      options: NavigateOptions = {
        openInNewTab: false,
        openInBackground: false,
      }
    ): void => {
      const state = stateRef.current;

      // If we've been asked to open a singleton page, we must switch to the
      // existing tab if there is one.
      if (PageConditions.isSingleton(page)) {
        const index = findExistingTab(state.tabs, page);
        if (index !== -1) {
          // There is an existing tab for this resource. Switch to it unless the
          // user has asked to open it in the background.
          if (!options.openInBackground) {
            dispatch({type: 'select', index});
          }
          return;
        }
      }

      // Let's see if we should navigate inside the current tab.
      const currentTab = state.tabs[state.currentTabIndex];
      const shouldNavigateWithinCurrent =
        !options.openInNewTab &&
        Tab.canNavigateWithin(currentTab) &&
        !PageConditions.alwaysOpenInNewTab(page);
      if (shouldNavigateWithinCurrent) {
        const message: Message = {
          type: 'navigate',
          index: state.currentTabIndex,
          page,
          title: Page.getInitialTitle(page, l10n),
        };

        if (Tab.isDirty(currentTab)) {
          const index = state.currentTabIndex;
          void confirmClose(index, index + 1, dispatch).then(canClose => {
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
        Tab.fromPage(genId(), page, l10n),
      ];
      if (Page.isLanguageChild(page)) {
        const parentIndex = findExistingTab(state.tabs, page.language);
        if (parentIndex === -1) {
          newTabs.unshift(Tab.fromPage(genId(), page.language, l10n));
        } else {
          insertIndex = findChildInsertIndex(state.tabs, parentIndex);
        }
      }

      dispatch({
        type: 'open',
        tabs: newTabs,
        insertIndex,
        background: !!options.openInBackground,
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
        if (Tab.isDirty(tab)) {
          void confirmClose(index, index + 1, dispatch).then(canClose => {
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
        void confirmClose(startIndex, endIndex, dispatch).then(canClose => {
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
  } as const), [l10n]);

  const value = useMemo<NavigationContextValue>(() => ({
    ...state,
    ...functions,
  }), [state, functions]);

  return (
    <NavigationContext.Provider value={value}>
      <NavigateToContext.Provider value={functions.navigateTo}>
        {children}
      </NavigateToContext.Provider>
    </NavigationContext.Provider>
  );
};

export default NavigationProvider;

const getInitialState = (l10n: ReactLocalization): State => ({
  tabs: [Tab.fromPage('home', HomePage, l10n)],
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
      state.tabs.splice(insertIndex, 0, ...tabs);
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
      if (state.currentTabIndex >= state.tabs.length) {
        state.currentTabIndex = state.tabs.length - 1;
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
  return tabs.findIndex(t => PageConditions.isSameResource(page, t.page));
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
  startIndex: number,
  endIndex: number,
  dispatch: Dispatch<Message>
): Promise<boolean> => {
  for (let i = startIndex; i < endIndex; i++) {
    // First, move to the tab so the user can see what's being confirmed.
    dispatch({type: 'select', index: i});
    // Wait one tick for the UI to update.
    await Promise.resolve();

    // TODO: Use custom message box code.
    // TODO: l10n
    const canClose = confirm('Discard unsaved changes?');
    if (!canClose) {
      // If the user does not wish to discard their unsaved changes, do *not*
      // restore the previous tab. Continue right here, so the user can have a
      // closer look at their unsaved work.
      return false;
    }
  }
  return true;
};
