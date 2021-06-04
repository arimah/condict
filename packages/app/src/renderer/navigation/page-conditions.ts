import {Page, HomePage, LanguagePage} from '../pages';

export type SingletonPage = HomePage | LanguagePage;

const PageConditions = {
  /**
   * Determines whether the specified page is a singleton. Singleton pages can
   * only have one tab per resource, and do not permit navigation within the
   * tab.
   * @param page The page to test.
   * @return True if the page is a singleton.
   */
  isSingleton(page: Page): page is SingletonPage {
    return page.type === 'language';
  },

  /**
   * Determines whether a currently open page represents the same resource as
   * a to-be-opened singleton page.
   * @param newPage The singleton page that wants to open.
   * @param existingPage The currently open page to test against.
   * @return True if the two pages represent the same resource.
   */
  isSameResource(newPage: SingletonPage, existingPage: Page): boolean {
    switch (newPage.type) {
      case 'home':
        return existingPage.type === 'home';
      case 'language':
        return (
          existingPage.type === 'language' &&
          newPage.id === existingPage.id
        );
    }
  },

  /**
   * Determines whether a page should always be opened in its own tab.
   * @param page The page to test.
   * @return True if the page must be opened in a new tab.
   */
  alwaysOpenInNewTab(page: Page): boolean {
    switch (page.type) {
      case 'home':
      case 'language':
        return true;
      default:
        return false;
    }
  },
} as const;

export default PageConditions;
