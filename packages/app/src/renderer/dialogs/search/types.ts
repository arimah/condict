import {LanguageId, LemmaId, DefinitionId} from '../../graphql';
import {Page, LemmaPage, DefinitionPage, LanguagePage} from '../../page';

export interface SearchResultState {
  readonly query: string;
  readonly loading: boolean;
  readonly results: readonly SearchResult[];
  readonly currentIndex: number;
  /**
   * If true, the currently selected item should be scrolled into view after the
   * list has rendered.
   *
   * When a new item is selected via keyboard input, we need to scroll it into
   * view. If the user hovers over the result list, we should never move things
   * around under the mouse.
   */
  readonly scrollToCurrent: boolean;
  readonly onSelect: (index: number | 'next' | 'prev') => void;
}

export type SearchResult =
  | LemmaSearchResult
  | DefinitionSearchResult;

export const SearchResult = {
  toPage(result: SearchResult): Page {
    const {language} = result;
    switch (result.type) {
      case 'lemma':
        return LemmaPage(
          result.id,
          result.term,
          LanguagePage(language.id, language.name)
        );
      case 'definition':
        return DefinitionPage(
          result.id,
          result.term,
          LanguagePage(language.id, language.name)
        );
    }
  },
} as const;

export interface LemmaSearchResult {
  readonly type: 'lemma';
  readonly id: LemmaId;
  /** The full term of the lemma. This is used for the LemmaPage. */
  readonly term: string;
  /** The term snippet, used to display highlight. */
  readonly termSnippet: Snippet;
  readonly partOfSpeechNames: readonly string[];
  readonly derivedFrom: readonly DerivedForm[];
  readonly language: ParentLanguage;
}

export interface DerivedForm {
  readonly formName: string;
  readonly sourceTerm: string;
}

export interface DefinitionSearchResult {
  readonly type: 'definition';
  readonly id: DefinitionId;
  readonly descriptionSnippet: Snippet;
  readonly term: string;
  readonly partOfSpeechName: string;
  readonly language: ParentLanguage;
}

export interface Snippet {
  readonly partialStart: boolean;
  readonly partialEnd: boolean;
  readonly parts: readonly SnippetPart[];
}

export interface SnippetPart {
  readonly isMatch: boolean;
  readonly text: string;
}

export interface ParentLanguage {
  readonly id: LanguageId;
  readonly name: string;
}
