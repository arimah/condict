import {ReactLocalization} from '@fluent/react';

import {
  LanguageId,
  LemmaId,
  DefinitionId,
  PartOfSpeechId,
} from '../graphql-shared';

export type Page =
  | HomePage
  | LanguagePage
  | LemmaPage
  | DefinitionPage
  | PartOfSpeechPage
  | SearchPage;

export const Page = {
  /**
   * Gets the initial tab title for a page.
   * @param page The page to get a title from.
   * @param l10n The current localization context.
   * @return A suitable initial tab title for the page.
   */
  getInitialTitle(page: Page, l10n: ReactLocalization): string {
    switch (page.type) {
      case 'home':
        return l10n.getString('sidebar-home-tab-title');
      case 'language':
        return page.name;
      case 'lemma':
      case 'definition':
        return page.term;
      case 'partOfSpeech':
        return page.name;
      case 'search':
        if (/\S/.test(page.query)) {
          return l10n.getString('sidebar-search-with-query-tab-title', {
            query: page.query.trim(),
          });
        }
        return l10n.getString('sidebar-search-empty-query-tab-title');
    }
  },

  /**
   * Determines whether the specified page can have children; that is, subpages
   * that are shown under the specified page.
   * @param page The page to test.
   * @return True if the page can have children.
   */
  canHaveChildren(page: Page): page is LanguagePage {
    return page.type === 'language';
  },

  /**
   * Determines whether the specified page is a child of a language.
   * @param page The page to test.
   * @return True if the page is the child of a language.
   */
  isLanguageChild(page: Page): page is Extract<Page, LanguageChild> {
    switch (page.type) {
      case 'lemma':
      case 'definition':
      case 'partOfSpeech':
        return true;
      default:
        return false;
    }
  },
} as const;

export interface HomePage {
  readonly type: 'home';
}

export const HomePage: HomePage = {type: 'home'};

export interface LanguagePage {
  readonly type: 'language';
  /** The ID of the language to show. */
  readonly id: LanguageId;
  /**
   * The name of the language, if available. Shown as the initial tab title
   * while the tab is loading.
   */
  readonly name: string;
}

export const LanguagePage = (id: LanguageId, name = ''): LanguagePage => ({
  type: 'language',
  id,
  name,
});

interface LanguageChild {
  /**
   * The language that this resource belongs to. The resource will be opened
   * under this language. If there is no open tab for the language, that will
   * be opened first.
   */
  readonly language: LanguagePage;
}

export interface LemmaPage extends LanguageChild {
  readonly type: 'lemma';
  /** The ID of the lemma to show. */
  readonly id: LemmaId;
  /**
   * The term that the lemma defines, if available. Shown as the initial tab
   * title when the tab is loading.
   */
  readonly term: string;
}

export const LemmaPage = (
  id: LemmaId,
  term: string,
  language: LanguagePage
): LemmaPage => ({
  type: 'lemma',
  id,
  term,
  language,
});

export interface DefinitionPage extends LanguageChild {
  readonly type: 'definition';
  /** The ID of the definition to show. */
  readonly id: DefinitionId;
  /**
   * The term that the definition belongs to, if available. Shown as the initial
   * tab title while the tab is loading.
   */
  readonly term: string;
}

export const DefinitionPage = (
  id: DefinitionId,
  term: string,
  language: LanguagePage
): DefinitionPage => ({
  type: 'definition',
  id,
  term,
  language,
});

export interface PartOfSpeechPage extends LanguageChild {
  readonly type: 'partOfSpeech';
  /** The ID of the part of speech to show. */
  readonly id: PartOfSpeechId;
  /**
   * The name of the part of speech, if available. Shown as the initial tab
   * title while the tab is loading.
   */
  readonly name: string;
}

export const PartOfSpeechPage = (
  id: PartOfSpeechId,
  name: string,
  language: LanguagePage
): PartOfSpeechPage => ({
  type: 'partOfSpeech',
  id,
  name,
  language,
});

export interface SearchPage {
  readonly type: 'search';
  /**
   * The initial search query. Shown in the initial tab title if it not empty
   * and not all white space.
   */
  readonly query: string;
}

export const SearchPage = (query = ''): SearchPage => ({
  type: 'search',
  query,
});
