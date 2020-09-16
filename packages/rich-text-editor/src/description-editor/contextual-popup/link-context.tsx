import React from 'react';
import {Editor, Element, Range, Point} from 'slate';
import {ReactEditor} from 'slate-react';
import EditIcon from 'mdi-react/PencilIcon';
import RemoveLinkIcon from 'mdi-react/LinkOffIcon';

import {useStaticCondictEditor} from '../../plugin';
import {isLink} from '../../node-utils';
import {CondictEditor} from '../../types';

import {PlacementRect} from '../popup';

import * as S from './styles';

export type Props = {
  link: Element;
  onEditLink: () => void;
};

const LinkContext = (props: Props): JSX.Element => {
  const {link, onEditLink} = props;

  const editor = useStaticCondictEditor();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const target = link.target!;

  return (
    <S.Columns>
      <S.PrimaryAction
        label={`Edit link: ${target.name || target.url} - ${target.type}`}
        title='Edit link'
        onClick={onEditLink}
      >
        <EditIcon/>
        <S.PrimaryLabel>{target.name || target.url}</S.PrimaryLabel>
        <S.SecondaryLabel>{target.type}</S.SecondaryLabel>
      </S.PrimaryAction>
      <S.Actions>
        <S.Action
          label='Remove link'
          title='Remove link'
          onClick={() => editor.removeLink()}
        >
          <RemoveLinkIcon/>
        </S.Action>
      </S.Actions>
    </S.Columns>
  );
};

export default LinkContext;

export interface ContextValue {
  readonly link: Element;
  readonly placement: PlacementRect;
}


const getNearestLink = (editor: CondictEditor): Element | null => {
  const {selection} = editor;
  if (!selection) {
    return null;
  }

  const [linkEntry] = Editor.nodes(editor, {match: isLink});
  if (!linkEntry) {
    return null;
  }

  const [link, linkPath] = linkEntry;
  const linkStart = Editor.start(editor, linkPath);
  const linkEnd = Editor.end(editor, linkPath);

  const selStart = Range.start(selection);
  const selEnd = Range.end(selection);

  // If the selection is entirely contained within the link, we can use it.
  // In other words, in these cases we can show the link popup:
  //
  //   lorem ipsum <a>dolor| sit</a> amet
  //                       - cursor
  //   loreum ipsum <a>do[lor sit]</a> amet
  //                     --------- selection
  //
  // But not here:
  //
  //   lorem [ipsum <a>dolor] sit</a> amet
  //   lorem ipsum <a>dolor [sit</a> amet]
  if (
    Point.isBefore(selStart, linkStart) ||
    Point.isAfter(selEnd, linkEnd)
  ) {
    return null;
  }
  return link;
};

export const getContextValue = (
  editor: CondictEditor,
  editorElem: HTMLDivElement,
  prev: ContextValue | null
): ContextValue | null => {
  const link = getNearestLink(editor);
  if (!link) {
    return null;
  }

  const anchor = ReactEditor.toDOMNode(editor, link);
  const rect = anchor.getBoundingClientRect();

  const editorRect = editorElem.getBoundingClientRect();

  const placement: PlacementRect = {
    x: rect.x - editorRect.x,
    y: rect.bottom - editorRect.y,
    parentWidth: editorRect.width,
  };

  // Prevent infinite update loops
  if (
    prev &&
    prev.link === link &&
    PlacementRect.equals(prev.placement, placement)
  ) {
    return prev;
  }
  return {link, placement};
};
