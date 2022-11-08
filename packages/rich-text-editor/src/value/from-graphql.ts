import {
  BlockElement,
  BlockType,
  Children,
  LinkElement,
  LinkTarget,
  LinkTargetType,
  InlineElement,
  CustomText,
} from '../types';

import * as Gql from './types';

const valueFromGraphQL = (
  blocks: readonly Gql.BlockElement[]
): BlockElement[] => {
  return blocks.map(convertBlock);
};

export default valueFromGraphQL;

const convertBlock = (block: Gql.BlockElement): BlockElement => {
  const children: Children = block.inlines.length > 0
    ? block.inlines.map(convertInline)
    : [{text: ''}];
  return {
    type: convertBlockKind(block.kind),
    indent: block.level,
    children,
  };
};

const convertBlockKind = (kind: Gql.BlockKind): BlockType => {
  switch (kind) {
    case 'PARAGRAPH':
      return 'paragraph';
    case 'HEADING_1':
      return 'heading1';
    case 'HEADING_2':
      return 'heading2';
    case 'OLIST_ITEM':
      return 'numberListItem';
    case 'ULIST_ITEM':
      return 'bulletListItem';
  }
};

const convertInline = (
  inline: Gql.InlineElement
): InlineElement | CustomText => {
  if (isLinkInline(inline)) {
    return convertLinkInline(inline);
  }
  return convertFormattedText(inline);
};

export {convertInline as inlineFromGraphQL};

const isLinkInline = (inline: Gql.InlineElement): inline is Gql.LinkInline =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  typeof (inline as any).linkTarget === 'string';

const convertLinkInline = (link: Gql.LinkInline): LinkElement => {
  const children = link.inlines.map(convertFormattedText);
  const target: LinkTarget = {
    url: link.linkTarget,
    type: link.internalLinkTarget
      ? getInternalLinkTargetType(link.internalLinkTarget)
      : 'url',
    name:
      link.internalLinkTarget
        ? getInternalLinkTargetName(link.internalLinkTarget)
        : undefined,
  };
  return {
    type: 'link',
    target,
    children,
  };
};

const getInternalLinkTargetType = (
  target: Gql.InternalLinkTarget
): LinkTargetType => {
  switch (target.__typename) {
    case 'LanguageLinkTarget':
      return 'language';
    case 'LemmaLinkTarget':
      return 'lemma';
    case 'DefinitionLinkTarget':
      return 'definition';
    case 'PartOfSpeechLinkTarget':
      return 'partOfSpeech';
  }
};

const getInternalLinkTargetName = (
  target: Gql.InternalLinkTarget
): string | undefined => {
  switch (target.__typename) {
    case 'LanguageLinkTarget':
      return target.language?.name;
    case 'LemmaLinkTarget':
      return target.lemma?.term;
    case 'DefinitionLinkTarget':
      return target.definition?.term;
    case 'PartOfSpeechLinkTarget':
      return target.partOfSpeech?.name;
  }
};

const convertFormattedText = (text: Gql.FormattedText): CustomText =>
  // No conversion necessary!
  text;
