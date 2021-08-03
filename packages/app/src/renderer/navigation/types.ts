import {ReactNode, RefObject} from 'react';
import {ReactLocalization} from '@fluent/react';

import {Page} from '../page';

export type TabState = 'idle' | 'loading' | 'crashed';

export interface Tab {
  /** A unique, randomly generated identifier for the tab. */
  readonly id: string;
  /** The page that the tab represents a view into. */
  readonly page: Page;
  /** The title of the tab, shown in the sidebar. */
  readonly title: string;
  /** True if the tab is dirty (has unsaved changes). */
  readonly dirty: boolean;
  /** The current state of the tab. */
  readonly state: TabState;
  /** The previous tab in the tab's history, or null if there is none. */
  readonly previous: PreviousTab | null;
  /** Current open panels in this tab. */
  readonly panels: readonly Panel[];
}

export const Tab = {
  /**
   * Determines whether the tab is a child tab.
   * @param tab The tab to test.
   * @return True if the tab is a child (drawn indented); false if it is a
   *         top-level tab.
   */
  isChild(tab: Tab): boolean {
    return Page.isLanguageChild(tab.page);
  },

  /**
   * Determines whether a tab is dirty (has unsaved changes).
   * @param tab The tab to test.
   * @return True if the tab has unsaved changes.
   */
  isDirty(tab: Tab): boolean {
    return tab.dirty || tab.panels.some(p => p.dirty);
  },

  /**
   * Determines whether the tab can have children. This does not mean the tab
   * definitely has children; only that it *might* have children.
   * @param tab The tab to test.
   * @return True if the tab can have children; false if it cannot.
   */
  canHaveChildren(tab: Tab): boolean {
    return Page.canHaveChildren(tab.page);
  },

  /**
   * Determines whether the specified tab can be closed.
   * @param tab The tab to test.
   * @return True if the tab can be closed; false if it is forced to stay open.
   */
  canClose(tab: Tab): boolean {
    return tab.page.type !== 'home';
  },

  /**
   * Determines whether the specified tab can be moved (dragged around to change
   * its order in the tab list).
   * @param tab The tab to test.
   * @return True if the tab can be moved; false if its position is fixed.
   */
  canMove(tab: Tab): boolean {
    return tab.page.type !== 'home';
  },

  /**
   * Determines whether navigation is allowed within the specified tab.
   * @param page The tab to test.
   * @return True if navigation is permitted within the tab; false if links must
   *         open new tabs.
   */
  canNavigateWithin(tab: Tab): boolean {
    switch (tab.page.type) {
      case 'home':
      case 'language':
      case 'tag':
        return false;
      default:
        return tab.panels.length === 0;
    }
  },

  /**
   * Gets the full (computed) title of a tab. This is the `title` of the tab
   * plus any additional text as determined by the page type.
   * @param tab The tab to get a title for.
   * @param l10n The current localization.
   * @return The full tab title.
   */
  getFullTitle(tab: Tab, l10n: ReactLocalization): string {
    switch (tab.page.type) {
      case 'home':
        return l10n.getString('sidebar-home-tab-title');
      case 'language':
        return l10n.getString('sidebar-language-tab-title', {name: tab.title});
      case 'lemma':
        return l10n.getString('sidebar-lemma-tab-title', {term: tab.title});
      case 'definition':
        return l10n.getString('sidebar-definition-tab-title', {
          term: tab.title,
        });
      case 'partOfSpeech':
        return l10n.getString('sidebar-part-of-speech-tab-title', {
          name: tab.title,
        });
      case 'inflectionTable':
        return l10n.getString('sidebar-inflection-table-tab-title', {
          name: tab.title,
        });
      case 'tag':
        return l10n.getString('sidebar-tag-tab-title', {
          name: tab.title,
        });
      case 'search':
        // The tab title contains the current search query
        if (/\S/.test(tab.title)) {
          return l10n.getString('sidebar-search-with-query-tab-title', {
            query: tab.title.trim(),
          });
        }
        return l10n.getString('sidebar-search-empty-query-tab-title');
    }
  },

  /**
   * Creates a new tab from a page.
   * @param id The new tab's ID.
   * @param page The page.
   * @return The new tab.
   */
  fromPage(id: string, page: Page): Tab {
    const title = Page.getInitialTitle(page);
    return {
      id,
      page,
      title,
      state: title === '' ? 'loading' : 'idle',
      dirty: false,
      previous: null,
      panels: [],
    };
  },
} as const;

export interface PreviousTab {
  /** The page that the tab represents a view into. */
  readonly page: Page;
  /** The title of the tab, shown in the sidebar. */
  readonly title: string;
  /** The current state of the tab. */
  readonly state: TabState;
  /** The previous tab in the tab's history, or null if there is none. */
  readonly previous: PreviousTab | null;
}

export interface Panel {
  /** A unique, randomly generated identifier for the panel. */
  readonly id: string;
  /** The title of the panel, for accessibility purposes. */
  readonly title: string;
  /** True if the panel is dirty (has unsaved changes). */
  readonly dirty: boolean;
  /** Renders the main content of the panel. */
  readonly render: (props: DynamicPanelProps) => ReactNode;
}

export interface PanelParams<R> {
  /** The initial title of the panel. */
  readonly initialTitle: string;
  /**
   * Renders the panel's content. This is *not* a component type, but a render
   * function that returns a React tree. It is not possible to use hooks inside
   * this callback.
   */
  readonly render: (props: PanelProps<R>) => ReactNode;
}

export type PanelProps<R> = {
  /**
   * Updates the panel's properties.
   * @param values New property values.
   */
  updatePanel: (
    values: {
      title?: string;
      dirty?: boolean;
    }
  ) => void;
  /** The outer element that contains the panel, for focus management. */
  panelRef: RefObject<HTMLElement>;
  /** True if the panel is still entering, for focus management. */
  entering: boolean;
  /**
   * A function to be called when the panel has a result. The panel will close
   * upon calling this function.
   * @param value The panel's result value.
   */
  onResolve: (value: R) => void;
};

export type DynamicPanelProps = Pick<
  PanelProps<unknown>,
  'panelRef' | 'entering'
>;

export type NavigateFn = (page: Page, options?: NavigateOptions) => void;

export interface NavigateOptions {
  /**
   * If true, requests that the page be opened in a new tab. Note the following
   * exceptions:
   *
   *   * Some pages always open in a new tab.
   *
   *   * Some resources only allow one page per resource. E.g., there can only
   *     be one tab per language. In that case, the application will switch to
   *     the existing tab if there is one, or open a new tab if there is none.
   *
   *   * Some pages do not allow in-page navigation, and all links clicked in
   *     them open in new tabs.
   *
   * In the above cases, this setting has no effect.
   */
  openInNewTab?: boolean;
  /**
   * If true, causes a new tab to be opened in the background. The application
   * will not focus it.
   */
  openInBackground?: boolean;
}

export interface NavigationContextValue {
  /** The currently open tabs. */
  readonly tabs: readonly Tab[];
  /** The index of the currently selected tab. */
  readonly currentTabIndex: number;

  readonly navigateTo: NavigateFn;
  /**
   * Selects the specified tab.
   * @param id The ID of the tab to select.
   */
  readonly select: (id: string) => void;
  /**
   * Selects the next or previous tab.
   * @param direction The selection direction.
   */
  readonly selectRelative: (direction: 'prev' | 'next') => void;
  /**
   * Requests to go to the previous page in a tab's history. If the tab has no
   * previous page, this is a no-op. If the tab has unsaved changes, the user
   * will be prompted before the tab is closed; in this case, the user can
   * choose to stay where they are.
   * @param id The ID of the tab to go back in. If omitted, the current tab is
   *        used.
   */
  readonly back: (id?: string) => void;
  /**
   * Requests to close a tab. If the tab has unsaved changes, the user will be
   * prompted before the tab is closed; in this case, the user can choose to
   * keep the tab open.
   * @param id The ID of the tab to close. If omitted, the current tab is used.
   */
  readonly close: (id?: string) => void;
  /**
   * Requests to move a tab to a new index. If the tab has any children, they
   * will be moved along with the parent tab.
   * @param id The ID of the tab to move.
   * @param newIndex The new index of the tab.
   */
  readonly move: (id: string, newIndex: number) => void;
}

/**
 * Updates a tab's properties.
 * @param id The ID of the tab to update.
 * @param values New values for the tab's properties.
 */
export type UpdateFreeTabFn = (id: string, values: UpdatableTabProps) => void;

/**
 * Updates a tab's properties.
 * @param id The ID of the tab to update.
 * @param values New values for the tab's properties.
 */
export type UpdateTabFn = (values: UpdatableTabProps) => void;

export type UpdatableTabProps = Partial<Pick<Tab, 'title' | 'dirty'>>;

/**
 * Opens a modal panel.
 * @param params Panel parameters.
 * @return A promise that resolves with the result of the modal panel. The
 *         promise resolves when the panel closes. The promise is rejected if
 *         the tab or panel already has a pending panel.
 */
export type OpenPanelFn = <R>(params: PanelParams<R>) => Promise<R>;

/**
 * Opens the first modal panel in a tab.
 *
 * This function is used internally, by TabContextProvider, so that component
 * can provide its tab with an OpenPanelFn.
 * @param tabId The owner tab's ID.
 * @param params Panel parameters.
 * @return A promise that resolves with the result of the modal pane. The
 *         promise resolves when the panel closes. The promise is rejected if
 *         the tab already has one or more panel.
 */
export type OpenFirstPanelFn = <R>(
  tabId: string,
  params: PanelParams<R>
) => Promise<R>;
