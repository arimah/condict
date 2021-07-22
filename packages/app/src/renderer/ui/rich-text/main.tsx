import React from 'react';

import {formatBlocks, formatInlines} from './format';
import {HeadingType, BlockFields, InlineFields} from './types';

export type RichContentProps = {
  value: readonly BlockFields[];
  heading1?: HeadingType;
  heading2?: HeadingType;
  stripLinks?: boolean;
  maxBlocks?: number;
};

// The basic component for a rich text block.
export const RichContent = React.memo((
  props: RichContentProps
): JSX.Element => {
  const {
    value,
    heading1 = 'h2',
    heading2 = 'h3',
    stripLinks = false,
    maxBlocks = -1,
  } = props;

  const blocks = formatBlocks(
    maxBlocks > 0 ? value.slice(0, maxBlocks) : value,
    heading1,
    heading2,
    stripLinks
  );

  if (blocks.length === 1) {
    return blocks[0];
  }
  return <>{blocks}</>;
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
