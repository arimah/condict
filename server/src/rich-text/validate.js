const {UserInputError} = require('apollo-server');

const {
  isCondictLink,
  parseCondictLink,
} = require('./condict-link');

// GraphQL validates types, including values of BlockKind and InlineKind types.
// Rather than repeat the schema here to double-check, we let GraphQL do its
// thing and perform only other kinds of validation.

const EmptyParagraph = Object.freeze({
  kind: 'PARAGRAPH',
  text: '',
});

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
// Partially overlapping inlines are not permitted, but no atttempt is made
// to detect them.
const compareInlines = (a, b) => a.start - b.start || b.end - a.end;

const validateInline = (inputInline, collectLinkReference) => {
  const result = {
    kind: inputInline.kind,
    start: inputInline.start,
    end: inputInline.end,
  };

  if (result.kind === 'LINK') {
    if (!collectLinkReference) {
      throw new UserInputError('Links are not permitted in this context');
    }
    if (!inputInline.linkTarget) {
      throw new UserInputError('Missing linkTarget on an inline of type LINK');
    }

    result.linkTarget = inputInline.linkTarget;
    if (isCondictLink(result.linkTarget)) {
      const link = parseCondictLink(result.linkTarget);
      collectLinkReference(link);
    }
  }

  return result;
};

const validateBlock = (inputBlock, collectLinkReference) => {
  const result = {
    kind: inputBlock.kind,
    text: inputBlock.text,
  };

  if (inputBlock.level && inputBlock.level > 0) {
    result.level = inputBlock.level;
  }

  if (inputBlock.inlines && inputBlock.inlines.length > 0) {
    result.inlines = inputBlock.inlines
      .map(inline => validateInline(inline, collectLinkReference))
      .sort(compareInlines);
  } else {
    result.inlines = null;
  }

  return result;
};

const validateDescription = (inputBlocks, collectLinkReference) => {
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

const validateTableCaption = inputCaption => {
  const result = {
    text: inputCaption.text,
  };

  if (inputCaption.inlines && inputCaption.inlines.length > 0) {
    result.inlines = inputCaption.inlines
      .map(inline => validateInline(inline))
      .sort(compareInlines);
  }

  return result;
};

module.exports = {
  validateInline,
  validateBlock,
  validateDescription,
  validateTableCaption,
};
