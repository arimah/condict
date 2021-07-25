import {
  DefaultInlineMessages,
  DefaultBlockMessages,
  DefaultLinkMessages,
} from '../messages';

import {Messages} from './types';

const DefaultMessages: Messages = {
  ...DefaultInlineMessages,
  ...DefaultBlockMessages,
  ...DefaultLinkMessages,
  contextualTools: () => 'Contextual tools',
  editLink: () => 'Edit link',
  editLinkLabel: (target, targetType) => `Edit link: ${target} - ${targetType}`,
  convertToIpa: () => 'Convert to IPA',
  convertToIpaLabel: ipa => `Convert to IPA: ${ipa}`,
  ipaDialogTitle: () => 'IPA',
  ipaDialogPlaceholder: () => 'nasal, alveolar, high tone, Eks-\\s{mp@, ...',
  ipaDialogInsert: () => 'Insert',
  // eslint-disable-next-line react/display-name
  ipaDialogNoMatches: query => <>No matches for <i>{query}</i>.</>,
  ipaDialogCheckSpelling: () => 'Check your spelling or try a less specific query.',
  linkDialogTitle: () => 'Link target',
  linkDialogPlaceholder: () => 'Web address or search terms',
  linkDialogSave: () => 'Save',
  linkDialogError: () =>
    'Please enter a web address, or a search term to select an item from the dictionary.',
};

export default DefaultMessages;
