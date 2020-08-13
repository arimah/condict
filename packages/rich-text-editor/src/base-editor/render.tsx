import React, {ComponentType} from 'react';
import {Element} from 'slate';
import {RenderElementProps, RenderLeafProps} from 'slate-react';

import * as B from './block-styles';
import * as S from './styles';

export const renderElement = (props: RenderElementProps): JSX.Element => {
  const {element, attributes, children} = props;
  let Component: string | ComponentType<any>;
  switch (element.type) {
    case 'link':
      return (
        <S.Link href={''} {...attributes}>
          {children}
        </S.Link>
      );
    case 'heading1':
      Component = B.Heading1;
      break;
    case 'heading2':
      Component = B.Heading2;
      break;
    case 'bulletListItem':
      Component = B.BulletListItem;
      break;
    case 'numberListItem':
      Component = B.NumberListItem;
      break;
    case 'paragraph':
      Component = B.Paragraph;
      break;
  }
  return (
    <Component data-indent={element.indent || 0} {...attributes}>
      {children}
    </Component>
  );
};

export const renderLeaf = (props: RenderLeafProps): JSX.Element => {
  const {leaf, attributes, children} = props;
  const {
    bold,
    italic,
    underline,
    strikethrough,
    subscript,
    superscript,
  } = leaf;

  let content = children;
  // Subscript and superscript are mutually exclusive.
  if (subscript) {
    content = <S.Subscript>{content}</S.Subscript>;
  } else if (superscript) {
    content = <S.Superscript>{content}</S.Superscript>;
  }

  return (
    <span
      {...attributes}
      style={{
        // 'bolder' so the text looks bold inside headings too.
        fontWeight: bold ? 'bolder' : undefined,
        fontStyle: italic ? 'italic' : undefined,
        textDecoration:
          underline && strikethrough ? 'underline line-through' :
          underline ? 'underline' :
          strikethrough ? 'line-through' :
          undefined,
      }}
    >
      {content}
    </span>
  );
};
