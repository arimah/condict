import {InlineMessages, BlockMessages, LinkMessages} from './types';

export const DefaultInlineMessages: InlineMessages = {
  formatGroup: () => 'Format',
  bold: () => 'Bold',
  italic: () => 'Italic',
  underline: () => 'Underline',
  strikethrough: () => 'Strike through',
  subscript: () => 'Subscript',
  superscript: () => 'Superscript',
};

export const DefaultBlockMessages: BlockMessages = {
  headingsGroup: () => 'Headings',
  heading1: () => 'Heading 1',
  heading2: () => 'Heading 2',
  listStyleGroup: () => 'List style',
  bulletedList: () => 'Bulleted list',
  numberedList: () => 'Numbered list',
  indent: () => 'Increase indentation',
  unindent: () => 'Decrease indentation',
  insertIpa: () => 'Insert IPA',
};

export const DefaultLinkMessages: LinkMessages = {
  linkGroup: () => 'Link',
  addEditLink: () => 'Add/edit link',
  removeLink: () => 'Remove link',
};
