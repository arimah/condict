import React, {RefObject, useState, useEffect} from 'react';
import {Editor, Point, Range, Element} from 'slate';
import {ReactEditor} from 'slate-react';

import {useCondictEditor} from '../../plugin';
import {isLink} from '../../node-utils';
import {CondictEditor} from '../../types';

import {PlacementRect} from '../popup';

import LinkPopup from './link-popup';

export type Props = {
  editorRef: RefObject<HTMLDivElement>;
  onOpenLinkDialog: () => void;
};

type Context = NoContext | LinkContext;

type NoContext = {
  readonly type: 'none';
};

const NoContext: NoContext = {type: 'none'};

type LinkContext = {
  readonly type: 'link';
  readonly link: Element;
  readonly placement: PlacementRect;
};

const placementEquals = (a: PlacementRect, b: PlacementRect): boolean =>
  a.x === b.x &&
  a.y === b.y &&
  a.parentWidth === b.parentWidth;

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

const ContextualPopup = (props: Props): JSX.Element | null => {
  const {editorRef, onOpenLinkDialog} = props;

  const editor = useCondictEditor();

  const [context, setContext] = useState<Context>(NoContext);

  useEffect(() => {
    if (!editorRef.current) {
      setContext(NoContext);
      return;
    }

    const link = getNearestLink(editor);
    if (link) {
      const anchor = ReactEditor.toDOMNode(editor, link);
      const rect = anchor.getBoundingClientRect();

      const editorRect = editorRef.current.getBoundingClientRect();

      setContext(context => {
        const placement: PlacementRect = {
          x: rect.x - editorRect.x,
          y: rect.bottom - editorRect.y,
          parentWidth: editorRect.width,
        };
        // Prevent infinite update loops
        if (
          context.type === 'link' &&
          context.link === link &&
          placementEquals(context.placement, placement)
        ) {
          return context;
        }
        return {type: 'link', link, placement};
      });
      return;
    }

    setContext(NoContext);
  });

  switch (context.type) {
    case 'link':
      return (
        <LinkPopup
          link={context.link}
          placement={context.placement}
          onEditLink={onOpenLinkDialog}
          onRemoveLink={editor.removeLink}
        />
      );
    case 'none':
      return null;
  }
};

export default ContextualPopup;
