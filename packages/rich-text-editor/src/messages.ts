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
  linkTargetType: type => {
    switch (type) {
      case 'language':
        return 'language';
      case 'lemma':
        return 'headword';
      case 'definition':
        return 'definition';
      case 'partOfSpeech':
        return 'part of speech';
      case 'tag':
        return 'tag';
      case 'url':
        return 'web address';
    }
  },
};
