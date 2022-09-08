import {ComponentType} from 'react';
import {RenderElementProps, RenderLeafProps} from 'slate-react';

import * as B from './block-styles';
import * as S from './styles';

export const renderElement = (props: RenderElementProps): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
      // List items are rendered with one deeper level of indentation, so that
      // the list marker actually fits.
      break;
    case 'numberListItem':
      Component = B.NumberListItem;
      break;
    case 'paragraph':
      Component = B.Paragraph;
      break;
  }
  const indent = element.indent ?? 0;
  return (
    <Component data-indent={indent} {...attributes}>
      {children}
    </Component>
  );
};

export const renderLeaf = (props: RenderLeafProps): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {leaf, attributes, children} = props;
  const {
    bold,
    italic,
    underline,
    strikethrough,
    subscript,
    superscript,
  } = leaf;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
