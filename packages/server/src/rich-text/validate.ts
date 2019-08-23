import {UserInputError} from 'apollo-server';

import {
  BlockElementInput,
  BlockKind,
  InlineElementInput,
  InlineKind,
  TableCaptionInput,
} from '../graphql/types';

import {
  CondictLink,
  BlockElementJson,
  InlineElementJson,
  TableCaptionJson,
} from './types';
import {
  isCondictLink,
  parseCondictLink,
} from './condict-link';

export type LinkRefCollector = (target: CondictLink) => void;

// GraphQL validates types, including values of BlockKind and InlineKind types.
// Rather than repeat the schema here to double-check, we let GraphQL do its
// thing and perform only other kinds of validation.

const EmptyParagraph: BlockElementJson = {
  kind: BlockKind.PARAGRAPH,
  text: '',
};

// Inlines are sorted by start index ascending, end index descending. This
// ensures that inlines are (1) in order, (2) nested correctly, in an outside-
// in manner. Example:
//
//   Lorem ipsum dolor sit amet.
//         |------------------|
//         |---------|
//                         |--|
//
// These inlines must be in this order, as the second and third are logically
// nested within the first. The order of the second and third inlines is
// actually unimportant as long as they don't overlap, but sorting in this
// manner takes care of everything neatly.
//
// Partially overlapping inlines are not permitted, but no attempt is made
// to detect them.
const compareInlines = (
  a: InlineElementInput,
  b: InlineElementInput
) => a.start - b.start || b.end - a.end;

export const validateInline = (
  inputInline: InlineElementInput,
  collectLinkReference?: LinkRefCollector
): InlineElementJson => {
  if (inputInline.kind === InlineKind.LINK) {
    if (!collectLinkReference) {
      throw new UserInputError('Links are not permitted in this context');
    }
    if (!inputInline.linkTarget) {
      throw new UserInputError('Missing linkTarget on an inline of type LINK');
    }

    const linkTarget = inputInline.linkTarget;
    if (isCondictLink(linkTarget)) {
      const link = parseCondictLink(linkTarget);
      collectLinkReference(link);
    }
    return {
      kind: InlineKind.LINK,
      start: inputInline.start,
      end: inputInline.end,
      linkTarget,
    };
  }

  return {
    kind: inputInline.kind,
    start: inputInline.start,
    end: inputInline.end,
  };
};

export const validateBlock = (
  inputBlock: BlockElementInput,
  collectLinkReference?: LinkRefCollector
): BlockElementJson => {
  const result: BlockElementJson = {
    kind: inputBlock.kind,
    text: inputBlock.text,
  };

  if (inputBlock.level != null && inputBlock.level > 0) {
    result.level = inputBlock.level;
  }

  let inlines: InlineElementJson[] | null = null;
  if (inputBlock.inlines && inputBlock.inlines.length > 0) {
    inlines = inputBlock.inlines
      // Validate each inline,
      .map(inline => validateInline(inline, collectLinkReference))
      // remove empty inlines,
      .filter(inline => inline.start !== inline.end)
      // and sort!
      .sort(compareInlines);
  }

  if (inlines && inlines.length > 0) {
    result.inlines = inlines;
  }

  return result;
};

export const validateDescription = (
  inputBlocks: BlockElementInput[],
  collectLinkReference?: LinkRefCollector
): BlockElementJson[] => {
  // Filter out empty blocks
  const nonEmptyBlocks = inputBlocks.filter(block => block.text !== '');

  // The description cannot have zero blocks. If there is no text content,
  // return a single empty paragraph.
  if (nonEmptyBlocks.length === 0) {
    return [EmptyParagraph];
  }

  return nonEmptyBlocks.map(block =>
    validateBlock(block, collectLinkReference)
  );
};

export const validateTableCaption = (
  inputCaption?: TableCaptionInput | null
): TableCaptionJson | null => {
  if (!inputCaption) {
    return null;
  }

  const result: TableCaptionJson = {
    text: inputCaption.text,
  };

  let inlines: InlineElementJson[] | null = null;
  if (inputCaption.inlines && inputCaption.inlines.length > 0) {
    inlines = inputCaption.inlines
      // Validate each inline,
      .map(inline => validateInline(inline))
      // remove empty inlines,
      .filter(inline => inline.start !== inline.end)
      // and sort!
      .sort(compareInlines);
  }

  if (inlines && inlines.length > 0) {
    result.inlines = inlines;
  }

  return result;
};
