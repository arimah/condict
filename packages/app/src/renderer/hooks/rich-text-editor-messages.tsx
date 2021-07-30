import {useMemo} from 'react';
import {Localized, useLocalization} from '@fluent/react';

import {
  DescriptionMessages,
  TableCaptionMessages,
} from '@condict/rich-text-editor';

export type RichTextMessages = DescriptionMessages & TableCaptionMessages;

export const useRichTextEditorMessages = (): RichTextMessages => {
  const {l10n} = useLocalization();
  return useMemo(() => ({
    formatGroup: () => l10n.getString('rich-text-format-group'),
    bold: () => l10n.getString('rich-text-bold'),
    italic: () => l10n.getString('rich-text-italic'),
    underline: () => l10n.getString('rich-text-underline'),
    strikethrough: () => l10n.getString('rich-text-strikethrough'),
    subscript: () => l10n.getString('rich-text-subscript'),
    superscript: () => l10n.getString('rich-text-superscript'),
    headingsGroup: () => l10n.getString('rich-text-headings-group'),
    heading1: () => l10n.getString('rich-text-heading1'),
    heading2: () => l10n.getString('rich-text-heading2'),
    listStyleGroup: () => l10n.getString('rich-text-list-style-group'),
    bulletedList: () => l10n.getString('rich-text-bulleted-list'),
    numberedList: () => l10n.getString('rich-text-numbered-list'),
    indent: () => l10n.getString('rich-text-indent'),
    unindent: () => l10n.getString('rich-text-unindent'),
    insertIpa: () => l10n.getString('rich-text-insert-ipa'),
    linkGroup: () => l10n.getString('rich-text-link-group'),
    addEditLink: () => l10n.getString('rich-text-add-edit-link'),
    removeLink: () => l10n.getString('rich-text-remove-link'),
    contextualTools: () => l10n.getString('rich-text-contextual-tools-title'),
    editLink: () => l10n.getString('rich-text-edit-link'),
    editLinkLabel: (target: string, targetType: string) =>
      l10n.getString('rich-text-edit-link-label', {
        target,
        targetType,
      }),
    convertToIpa: () => l10n.getString('rich-text-convert-to-ipa'),
    convertToIpaLabel: (ipa: string) =>
      l10n.getString('rich-text-convert-to-ipa-label', {ipa}),
    ipaDialogTitle: () => l10n.getString('rich-text-ipa-dialog-title'),
    ipaDialogPlaceholder: () =>
      l10n.getString('rich-text-ipa-dialog-placeholder'),
    ipaDialogInsert: () => l10n.getString('rich-text-ipa-dialog-insert'),
    // eslint-disable-next-line react/display-name
    ipaDialogNoMatches: (query: string) =>
      <Localized
        id='rich-text-ipa-dialog-no-matches'
        vars={{query}}
        elems={{query: <i/>}}
      >
        <></>
      </Localized>,
    ipaDialogCheckSpelling: () =>
      l10n.getString('rich-text-ipa-dialog-search-hint'),
    linkDialogTitle: () => l10n.getString('rich-text-link-dialog-title'),
    linkDialogPlaceholder: () =>
      l10n.getString('rich-text-link-dialog-placeholder'),
    linkDialogSave: () => l10n.getString('rich-text-link-dialog-save'),
    linkDialogError: () => l10n.getString('rich-text-link-dialog-error'),
  }), [l10n]);
};
