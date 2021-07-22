import React, {ReactChild, ReactNode} from 'react';

import {
  Page,
  LanguagePage,
  LemmaPage,
  DefinitionPage,
  PartOfSpeechPage,
} from '../../page';
import {BlockKind} from '../../graphql';

import Link from '../link';
import BrokenLink from '../broken-link';

import {
  HeadingType,
  BlockFields,
  InlineFields,
  LinkFields,
  FormattedText,
} from './types';

const Indent = 32; // pixels

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

export const formatBlocks = (
  blocks: readonly BlockFields[],
  h1: HeadingType,
  h2: HeadingType,
  stripLinks: boolean
): JSX.Element[] => {
  const blockTags: Record<BlockKind, string> = {
    PARAGRAPH: 'p',
    HEADING_1: h1,
    HEADING_2: h2,
    OLIST_ITEM: 'ol',
    ULIST_ITEM: 'ul',
  };

  let nextIndex = 0;

  const elements: JSX.Element[] = [];
  while (nextIndex < blocks.length) {
    const block = blocks[nextIndex++];
    elements.push(formatBlock(block, 0));
  }
  return elements;

  function formatBlock(block: BlockFields, baseIndent: number): JSX.Element {
    const key = nextIndex;

    let children: ReactNode = null;
    switch (block.kind) {
      case 'PARAGRAPH':
      case 'HEADING_1':
      case 'HEADING_2':
        children = formatInlines(block.inlines, stripLinks);
        break;
      case 'OLIST_ITEM':
      case 'ULIST_ITEM': {
        const items = [formatListItem(block)];
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
          items.push(formatListItem(nextBlock));
        }
        children = items;
        break;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const Tag = blockTags[block.kind] as any;
    const indent = block.level - baseIndent;
    const style = indent > 0
      ? {marginInlineStart: `${indent * Indent}px`}
      : undefined;
    return <Tag key={key} style={style}>{children}</Tag>;
  }

  function formatListItem(item: BlockFields): JSX.Element {
    // The list item's own content is *not* wrapped in a <p> or anything else.
    const key = nextIndex;
    const children: ReactNode[] = [formatInlines(item.inlines, stripLinks)];

    while (nextIndex < blocks.length) {
      const nextBlock = blocks[nextIndex];
      // If the next block is indented deeper than the list item, then it
      // belongs to the list item.
      if (nextBlock.level <= item.level) {
        break;
      }

      nextIndex++;
      children.push(formatBlock(nextBlock, item.level + 1));
    }

    return <li key={key}>{children}</li>;
  }
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
    let page: Page | null;
    switch (link.internalLinkTarget.__typename) {
      case 'LanguageLinkTarget': {
        const {language} = link.internalLinkTarget;
        page = language && LanguagePage(language.id, language.name);
        break;
      }
      case 'LemmaLinkTarget': {
        const {lemma} = link.internalLinkTarget;
        page = lemma && LemmaPage(
          lemma.id,
          lemma.term,
          LanguagePage(lemma.language.id, lemma.language.name)
        );
        break;
      }
      case 'DefinitionLinkTarget': {
        const {definition} = link.internalLinkTarget;
        page = definition && DefinitionPage(
          definition.id,
          definition.term,
          LanguagePage(definition.language.id, definition.language.name)
        );
        break;
      }
      case 'PartOfSpeechLinkTarget': {
        const {partOfSpeech} = link.internalLinkTarget;
        page = partOfSpeech && PartOfSpeechPage(
          partOfSpeech.id,
          partOfSpeech.name,
          LanguagePage(partOfSpeech.language.id, partOfSpeech.language.name)
        );
        break;
      }
    }

    if (!page) {
      return (
        <BrokenLink key={key} href={link.linkTarget}>
          {content}
        </BrokenLink>
      );
    }
    return <Link key={key} to={page}>{content}</Link>;
  } else {
    return <a key={key} href={link.linkTarget}>{content}</a>;
  }
};

const formatText = (text: FormattedText, key: number): ReactNode => {
  let node: ReactChild = text.text;

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
