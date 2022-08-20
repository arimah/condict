import React, {ReactNode} from 'react';

import {BlockKind} from '../../graphql';

import InternalLink from './internal-link';
import {
  BlockElementTag,
  BlockFields,
  InlineFields,
  LinkFields,
  FormattedText,
} from './types';

/*
 * A few noteworthy things:
 *
 * 1. There are no explicit list blocks, only list items. Lists are defined by
 *    adjacency and indentation level. If you have two OLIST_ITEM in sequence,
 *    at the same indentation level, then they are part of the same list.
 *
 * 2. Lists can contain nested blocks, including other lists. Blocks that are at
 *    least one level deeper than the list item belong to that list item. As an
 *    example, consider the following structure:
 *
 *    - OLIST_ITEM level 0
 *    - PARAGRAPH level 1
 *    - ULIST_ITEM level 1
 *    - PARAGRAPH level 2
 *    - ULIST_ITEM level 1
 *    - OLIST_ITEM level 0
 *
 *    Everything between the first OLIST_ITEM and the second belongs to that
 *    first list item. The second OLIST_ITEM is at the same level as the first,
 *    so belongs to the same list. The two ULIST_ITEMs are at the same level, so
 *    make up a single list, and the level 2 paragraph belongs to the first item
 *    in that list. We end up with:
 *
 *        <ol>
 *          <li>
 *            ...             -- content of first OLIST_ITEM
 *            <p>...</p>      -- PARAGRAPH
 *            <ul>
 *              <li>
 *                ...         -- content of first ULIST_ITEM
 *                <p>...</p>  -- PARAGRAPH
 *              </li>
 *              <li>...</li>  -- second ULIST_ITEM
 *            </ul>
 *          <li>...</li>      -- second OLIST_ITEM
 *        </ol>
 *
 * 3. List items come with their own indentation, so we need to subtract the
 *    list's indentation level + 1 from all its children. In the example above,
 *    the first PARAGRAPH is indented 1 level by the list, so the effective
 *    indentation is 1 - 1 = 0.
 */

export interface FormatBlocksOptions {
  tags?: {
    p?: BlockElementTag;
    h1?: BlockElementTag;
    h2?: BlockElementTag;
    ol?: BlockElementTag;
    ul?: BlockElementTag;
    li?: BlockElementTag;
  };
  stripLinks?: boolean;
}

type NestedBlock =
  | SimpleBlock
  | ListBlock;

interface SimpleBlock {
  readonly kind: Exclude<BlockKind, 'OLIST_ITEM' | 'ULIST_ITEM'>;
  readonly indent: number;
  readonly inlines: readonly InlineFields[];
}

interface ListBlock {
  readonly kind: 'OLIST_ITEM' | 'ULIST_ITEM';
  readonly indent: number;
  readonly items: readonly ListItem[];
}

interface ListItem {
  readonly inlines: readonly InlineFields[];
  readonly children: readonly NestedBlock[];
}

const Indent = 32; // pixels

export const formatBlocks = (
  blocks: readonly BlockFields[],
  options: FormatBlocksOptions = {}
): JSX.Element[] => {
  const {tags = {}, stripLinks = false} = options;

  const blockTags: Record<BlockKind | 'li', BlockElementTag> = {
    PARAGRAPH: tags.p ?? 'p',
    HEADING_1: tags.h1 ?? 'h2',
    HEADING_2: tags.h2 ?? 'h3',
    // Note: `OLIST_ITEM` and `ULIST_ITEM` are actually used for the list,
    // while list items use `li`. This way we don't have to translate back
    // and forth.
    OLIST_ITEM: tags.ol ?? 'ol',
    ULIST_ITEM: tags.ul ?? 'ul',
    li: tags.li ?? 'li',
  };

  const tree = nestBlocks(blocks);
  return tree.map((block, i) =>
    formatBlock(
      i,
      block,
      blockTags,
      stripLinks,
      i === 0,
      i === tree.length - 1
    )
  );
};

export const formatInlines = (
  inlines: readonly InlineFields[],
  stripLinks: boolean
): ReactNode => {
  const elements = inlines.map((inline, index) =>
    formatInline(inline, index, stripLinks)
  );
  if (elements.length === 1) {
    return elements[0];
  }
  return elements;
};

const nestBlocks = (blocks: readonly BlockFields[]): NestedBlock[] => {
  let nextIndex = 0;

  const items: NestedBlock[] = [];
  while (nextIndex < blocks.length) {
    const block = blocks[nextIndex++];
    items.push(visitBlock(block, 0));
  }
  return items;

  function visitBlock(block: BlockFields, baseLevel: number): NestedBlock {
    const indent = block.level - baseLevel;
    switch (block.kind) {
      case 'PARAGRAPH':
      case 'HEADING_1':
      case 'HEADING_2':
        return {kind: block.kind, indent, inlines: block.inlines};
      case 'OLIST_ITEM':
      case 'ULIST_ITEM': {
        const items = [visitListItem(block)];
        // Collect subsequent list items of the same type and at the same level
        // as children of this list.
        while (nextIndex < blocks.length) {
          const nextBlock = blocks[nextIndex];
          if (
            nextBlock.kind !== block.kind ||
            nextBlock.level !== block.level
          ) {
            // Not a list item of the same kind or a list item at a different
            // level of indentation.
            break;
          }

          nextIndex++;
          items.push(visitListItem(nextBlock));
        }
        return {kind: block.kind, indent, items};
      }
    }
  }

  function visitListItem(item: BlockFields): ListItem {
    const children: NestedBlock[] = [];

    while (nextIndex < blocks.length) {
      const nextBlock = blocks[nextIndex];
      // If the next block is indented deeper than the list item, then it
      // belongs to the list item.
      if (nextBlock.level <= item.level) {
        break;
      }

      nextIndex++;
      children.push(visitBlock(nextBlock, item.level + 1));
    }

    return {inlines: item.inlines, children};
  }
};

const formatBlock = (
  key: number,
  block: NestedBlock,
  tags: Record<BlockKind | 'li', BlockElementTag>,
  stripLinks: boolean,
  isFirst: boolean,
  isLast: boolean
): JSX.Element => {
  let children: ReactNode;
  switch (block.kind) {
    case 'PARAGRAPH':
    case 'HEADING_1':
    case 'HEADING_2':
      children = formatInlines(block.inlines, stripLinks);
      break;
    case 'OLIST_ITEM':
    case 'ULIST_ITEM': {
      const count = block.items.length;
      children = block.items.map((item, i) =>
        formatListItem(
          i,
          item,
          tags,
          stripLinks,
          isFirst && i === 0,
          isLast && i === count - 1
        )
      );
      break;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const Tag = tags[block.kind];
  const style = block.indent > 0
    ? {marginInlineStart: `${block.indent * Indent}px`}
    : undefined;
  return (
    <Tag
      key={key}
      className={getBlockClass(isFirst, isLast)}
      style={style}
    >
      {children}
    </Tag>
  );
};

const formatListItem = (
  key: number,
  item: ListItem,
  tags: Record<BlockKind | 'li', BlockElementTag>,
  stripLinks: boolean,
  isFirst: boolean,
  isLast: boolean
): JSX.Element => {
  const childCount = item.children.length;
  const Tag = tags.li;
  return (
    <Tag key={key} className={getBlockClass(isFirst, isLast)}>
      {formatInlines(item.inlines, stripLinks)}
      {childCount > 0 ? (
        item.children.map((child, i) =>
          formatBlock(
            i,
            child,
            tags,
            stripLinks,
            false,
            isLast && i === childCount - 1
          )
        )
      ) : null}
    </Tag>
  );
};

const getBlockClass = (
  isFirst: boolean,
  isLast: boolean
): string | undefined =>
  isFirst
    ? isLast
      ? 'first-block last-block'
      : 'first-block'
    : isLast
      ? 'last-block'
      : undefined;

const formatInline = (
  inline: InlineFields,
  key: number,
  stripLinks: boolean
): ReactNode => {
  if (inline.__typename === 'LinkInline') {
    if (stripLinks) {
      return inline.inlines.map(formatText);
    }
    return formatLink(inline, key);
  }
  return formatText(inline, key);
};

const formatLink = (link: LinkFields, key: number): JSX.Element => {
  const content = link.inlines.map(formatText);

  if (link.internalLinkTarget) {
    return (
      <InternalLink key={key} target={link.internalLinkTarget}>
        {content}
      </InternalLink>
    );
  } else {
    return <a key={key} href={link.linkTarget}>{content}</a>;
  }
};

const formatText = (text: FormattedText, key: number): ReactNode => {
  let node: JSX.Element | string = text.text;

  if (text.bold) {
    node = <b>{node}</b>;
  }
  if (text.italic) {
    node = <i>{node}</i>;
  }
  if (text.underline) {
    node = <u>{node}</u>;
  }
  if (text.strikethrough) {
    node = <s>{node}</s>;
  }

  if (text.superscript) {
    node = <sup>{node}</sup>;
  } else if (text.subscript) {
    node = <sub>{node}</sub>;
  }

  if (typeof node !== 'string') {
    return React.cloneElement(node, {key});
  }
  return node;
};
