import {Element} from 'slate';

import {
  BlockElement,
  BlockType,
  InlineElement,
  LinkElement,
  CustomText,
} from '../types';

import * as Gql from './types';

const valueToGraphQLInput = (
  blocks: readonly Readonly<BlockElement>[]
): Gql.BlockElementInput[] => {
  return blocks.map(convertBlock);
};

export default valueToGraphQLInput;

const convertBlock = (block: Readonly<BlockElement>): Gql.BlockElementInput => {
  const inlines = block.children.map(convertInline);
  const result: Gql.BlockElementInput = {
    kind: convertBlockType(block.type),
    inlines,
  };
  if (block.indent) {
    result.level = block.indent;
  }
  return result;
};

const convertBlockType = (type: BlockType): Gql.BlockKind => {
  switch (type) {
    case 'paragraph':
      return 'PARAGRAPH';
    case 'heading1':
      return 'HEADING_1';
    case 'heading2':
      return 'HEADING_2';
    case 'numberListItem':
      return 'OLIST_ITEM';
    case 'bulletListItem':
      return 'ULIST_ITEM';
  }
};

const convertInline = (
  inline: InlineElement | CustomText
): Gql.InlineElementInput => {
  if (Element.isElement(inline)) {
    return {link: convertLink(inline)};
  }
  return {text: convertFormattedText(inline)};
};

const convertLink = (link: LinkElement): Gql.LinkInlineInput => {
  const inlines = link.children.map(convertFormattedText);
  return {
    linkTarget: link.target.url,
    inlines,
  };
};

const convertFormattedText = (text: CustomText): Gql.FormattedTextInput => {
  const result: Gql.FormattedTextInput = {
    text: text.text,
  };
  if (text.bold) {
    result.bold = true;
  }
  if (text.italic) {
    result.italic = true;
  }
  if (text.underline) {
    result.underline = true;
  }
  if (text.strikethrough) {
    result.strikethrough = true;
  }
  if (text.subscript) {
    result.subscript = true;
  }
  if (text.superscript) {
    result.superscript = true;
  }
  return result;
};

export {convertFormattedText as formattedTextToGraphQLInput};
