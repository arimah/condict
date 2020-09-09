import {UserInputError} from 'apollo-server';

import {
  BlockElementInput,
  InlineElementInput,
  FormattedTextInput,
  TableCaptionInput,
} from '../graphql/types';

import {
  CondictLink,
  BlockElementJson,
  InlineElementJson,
  FormattedTextJson,
  TableCaptionJson,
} from './types';
import {
  isCondictLink,
  parseCondictLink,
} from './condict-link';

export type LinkRefCollector = (target: CondictLink) => void;

// GraphQL validates types, including enum values like BlockKind.
// Rather than repeat the schema here to double-check, we let GraphQL do its
// thing and perform only other kinds of validation.

const EmptyParagraph: BlockElementJson = {
  kind: 'PARAGRAPH',
  inlines: [{text: ''}],
};

const validateFormattedText = (text: FormattedTextInput): FormattedTextJson => {
  const result: FormattedTextJson = {text: text.text};
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
  } else if (text.superscript) {
    result.superscript = true;
  }
  return result;
};

const validateInline = (
  inputInline: InlineElementInput,
  collectLinkReference?: LinkRefCollector
): InlineElementJson => {
  if (inputInline.link) {
    const {link} = inputInline;

    if (inputInline.text) {
      throw new UserInputError('Inline element cannot have both `link` and `text`');
    }
    if (!collectLinkReference) {
      throw new UserInputError('Links are not permitted in this context');
    }

    if (isCondictLink(link.linkTarget)) {
      const internalLink = parseCondictLink(link.linkTarget);
      collectLinkReference(internalLink);
    }
    return {
      linkTarget: link.linkTarget,
      inlines: link.inlines
        .map(validateFormattedText)
        // Remove empty text nodes
        .filter(t => !FormattedTextJson.isEmpty(t)),
    };
  }

  if (inputInline.text) {
    return validateFormattedText(inputInline.text);
  }

  throw new UserInputError('Inline element must have either `link` or `text`');
};

const validateBlock = (
  inputBlock: BlockElementInput,
  collectLinkReference?: LinkRefCollector
): BlockElementJson => {
  const result: BlockElementJson = {
    kind: inputBlock.kind,
    inlines: inputBlock.inlines
      .map(inline => validateInline(inline, collectLinkReference))
      // Remove empty inlines
      .filter(inline => !InlineElementJson.isEmpty(inline)),
  };

  if (result.inlines.length === 0) {
    // There must be at least one text inline in every block.
    result.inlines.push({text: ''});
  }

  if (inputBlock.level != null && inputBlock.level > 0) {
    result.level = inputBlock.level;
  }

  return result;
};

export const validateDescription = (
  inputBlocks: BlockElementInput[],
  collectLinkReference?: LinkRefCollector
): BlockElementJson[] => {
  // Note: While we do remove empty inlines (as they serve no purpose at all),
  // we cannot remove empty *blocks* willy-nilly. The user may have put them
  // there for extra spacing or similar. However, we can and do trim empty
  // blocks at the start and end.
  const blocks = inputBlocks.map(block =>
    validateBlock(block, collectLinkReference)
  );

  // Trim empty blocks from the start.
  while (blocks.length > 0 && BlockElementJson.isEmpty(blocks[0])) {
    blocks.shift();
  }
  // Trim empty blocks from the end.
  while (
    blocks.length > 0 &&
    BlockElementJson.isEmpty(blocks[blocks.length - 1])
  ) {
    blocks.pop();
  }

  // The description cannot have zero blocks. If we trimmed away everything,
  // return a single empty paragraph.
  return blocks.length === 0 ? [EmptyParagraph] : blocks;
};

export const validateTableCaption = (
  inputCaption?: TableCaptionInput | null
): TableCaptionJson | null => {
  if (!inputCaption) {
    return null;
  }

  const caption: TableCaptionJson = {
    inlines: inputCaption.inlines
      .map(validateFormattedText)
      // Remove empty text nodes
      .filter(text => !FormattedTextJson.isEmpty(text)),
  };

  if (TableCaptionJson.isEmpty(caption)) {
    return null;
  }

  return caption;
};
