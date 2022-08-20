import React from 'react';

import {formatBlocks, formatInlines} from './format';
import {
  BlockElementTag,
  BlockFields,
  InlineFields,
  FormattedText,
} from './types';
import * as S from './styles';

export type RichContentProps = {
  value: readonly BlockFields[];
  heading1?: BlockElementTag;
  heading2?: BlockElementTag;
  stripLinks?: boolean;
  maxLines?: number;
  selectable?: boolean;
};

// The basic component for a rich text block.
export const RichContent = React.memo((
  props: RichContentProps
): JSX.Element => {
  const {
    value,
    heading1,
    heading2,
    stripLinks,
    maxLines = 0,
    selectable = false,
  } = props;

  const blocks = formatBlocks(
    // +1 so we are guaranteed "..." overflow if there are overflowing blocks.
    maxLines > 0 ? value.slice(0, maxLines + 1) : value,
    {
      tags: {
        h1: heading1,
        h2: heading2,
      },
      stripLinks,
    }
  );

  return (
    <S.Container
      clamped={maxLines > 0}
      selectable={selectable}
      style={maxLines > 0 ? {WebkitLineClamp: maxLines} : undefined}
    >
      {blocks}
    </S.Container>
  );
});

RichContent.displayName = 'RichContent';

export type RichTextProps = {
  value: readonly InlineFields[];
  stripLinks?: boolean;
};

export const RichText = React.memo((props: RichTextProps): JSX.Element => {
  const {value, stripLinks = false} = props;

  const inlines = formatInlines(value, stripLinks);
  if (React.isValidElement(inlines)) {
    return inlines;
  }
  return <>{inlines}</>;
});

RichText.displayName = 'RichText';

/**
 * Determines whether the given rich text content actually has content. The rich
 * text blocks are considered to have content if there exists at least one block
 * whose text content is not empty.
 * @param value The rich content to check.
 * @return True if there is at least one block whose text content is not empty.
 */
export const hasRichContent = (value: readonly BlockFields[]): boolean =>
  value.some(blockHasContent);

const blockHasContent = (block: BlockFields): boolean =>
  block.inlines.some(inlineHasContent);

const inlineHasContent = (inline: InlineFields): boolean =>
  inline.__typename === 'FormattedText'
    ? inline.text !== ''
    : inline.inlines.some(textIsNotEmpty);

const textIsNotEmpty = (text: FormattedText): boolean => text.text !== '';
