import {ReactNode} from 'react';

import {InlineMessages, BlockMessages, LinkMessages} from '../types';

export interface Messages extends InlineMessages, BlockMessages, LinkMessages {
  /** "Contextual tools", SR-only name of the contextual tools popup. */
  contextualTools(): string;
  /** "Edit link", button tooltip in contextual tools popup. */
  editLink(): string;
  /**
   * "Edit link: $target - $targetType", SR-only label of edit link button in
   * contextual tools popup.
   * @param target The link target. This is either the name of a dictionary
   *        resource or a URL.
   * @param targetType The target type, such as 'language', 'definition', or
   *        'web address'.
   */
  editLinkLabel(target: string, targetType: string): string;
  /** * "Convert to IPA", button text in contextual tools popup. */
  convertToIpa(): string;
  /**
   * "Convert to IPA: $ipa", SR-only label of button in contextual tools popup.
   * @param ipa The IPA text that the input will be converted to.
   */
  convertToIpaLabel(ipa: string): string;
  /** "IPA"", dialog title. */
  ipaDialogTitle(): string;
  /**
   * Placeholder for search input in IPA dialog. Contains sample search queries.
   * Note that it's currently only possible to search in English.
   */
  ipaDialogPlaceholder(): string;
  /** "Insert", button in IPA dialog. */
  ipaDialogInsert(): string;
  /** "No matches for <i>$query</i>", IPA dialog text. */
  ipaDialogNoMatches(query: string): ReactNode;
  /** "Check your spelling or try a less specific query.", IPA dialog text. */
  ipaDialogCheckSpelling(): string;
  /** "Link target", dialog title. */
  linkDialogTitle(): string;
  /**
   * "Web address or search terms", placeholder for search input in link dialog.
   */
  linkDialogPlaceholder(): string;
  /** "Save", button in link dialog. */
  linkDialogSave(): string;
  /** Error message shown when attempting to save with nothing selected. */
  linkDialogError(): string;
}
