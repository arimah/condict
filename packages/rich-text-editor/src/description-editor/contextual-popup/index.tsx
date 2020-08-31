import React, {RefObject, MouseEvent, useState, useEffect} from 'react';
import {Element} from 'slate';

import {useCondictEditor} from '../../plugin';
import {useDebouncedCallback} from '../../debounce';

import {PlacementRect} from '../popup';

import LinkContext, {
  ContextValue as LinkContextValue,
  getContextValue as getLinkContextValue,
} from './link-context';
import PhoneticContext, {
  ContextValue as PhoneticContextValue,
  getContextValue as getPhoneticContextValue,
} from './phonetic-context';
import * as S from './styles';

export type Props = {
  editorRef: RefObject<HTMLDivElement>;
  onOpenLinkDialog: () => void;
};

const getPlacement = (
  ...placements: (PlacementRect | undefined)[]
): PlacementRect | undefined =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  placements.reduce((prev, next) => {
    if (!prev) {
      return next;
    }
    if (!next) {
      return prev;
    }
    return {
      x: Math.min(prev.x, next.x),
      y: Math.max(prev.y, next.y),
      parentWidth: prev.parentWidth,
    };
  });

const Width = 340;

const preventMouseFocus = (e: MouseEvent) => e.preventDefault();

const ContextualPopup = (props: Props): JSX.Element | null => {
  const {editorRef, onOpenLinkDialog} = props;

  const editor = useCondictEditor();

  const [link, setLink] = useState<LinkContextValue | null>(null);
  const [phonetic, setPhonetic] = useState<PhoneticContextValue | null>(null);

  const updateContext = useDebouncedCallback(400, () => {
    const editorElem = editorRef.current;
    if (!editorElem) {
      return;
    }

    setLink(prev => getLinkContextValue(editor, editorElem, prev));
    setPhonetic(prev => getPhoneticContextValue(editor, editorElem, prev));
  }, []);

  useEffect(() => {
    // Hide the popups while editing the document.
    setLink(null);
    setPhonetic(null);

    updateContext();
  }, [editor.children, editor.selection]);

  const placement = getPlacement(link?.placement, phonetic?.placement);

  if (!placement) {
    return null;
  }

  return (
    <S.Popup
      width={Width}
      placement={placement}
      onMouseDown={preventMouseFocus}
    >
      {link && <LinkContext link={link.link} onEditLink={onOpenLinkDialog}/>}
      {phonetic && <PhoneticContext range={phonetic.range}/>}
    </S.Popup>
  );
};

export default ContextualPopup;
