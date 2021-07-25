import {InlineMessages, BlockMessages, LinkMessages} from './types';

export const DefaultInlineMessages: InlineMessages = {
  bold: () => 'Bold',
  italic: () => 'Italic',
  underline: () => 'Underline',
  strikethrough: () => 'Strike through',
  subscript: () => 'Subscript',
  superscript: () => 'Superscript',
};

export const DefaultBlockMessages: BlockMessages = {
  heading1: () => 'Heading 1',
  heading2: () => 'Heading 2',
  bulletedList: () => 'Bulleted list',
  numberedList: () => 'Numbered list',
  indent: () => 'Increase indentation',
  unindent: () => 'Decrease indentation',
  insertIpa: () => 'Insert IPA',
};

export const DefaultLinkMessages: LinkMessages = {
  addEditLink: () => 'Add/edit link',
  removeLink: () => 'Remove link',
};
