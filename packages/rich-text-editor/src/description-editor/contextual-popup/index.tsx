import React, {
  Ref,
  RefObject,
  MouseEvent,
  KeyboardEvent,
  useState,
  useCallback,
  useRef,
  useEffect,
  useImperativeHandle,
} from 'react';
import {ReactEditor, useSlate} from 'slate-react';

import {Shortcut} from '@condict/ui';

import {PlacementRect} from '../popup';
import {CloseKey} from '../dialog';

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
  onOpenIpaDialog: () => void;
};

export interface ContextualPopupHandle {
  readonly focus: () => void;
  readonly contains: (node: Node | null) => boolean;
}

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

const preventMouseFocus = (e: MouseEvent) => e.preventDefault();

const ContextualPopup = React.forwardRef((
  props: Props,
  ref: Ref<ContextualPopupHandle>
): JSX.Element | null => {
  const {editorRef, onOpenLinkDialog, onOpenIpaDialog} = props;

  const editor = useSlate();

  const rootRef = useRef<HTMLFormElement>(null);

  const [link, setLink] = useState<LinkContextValue | null>(null);
  const [phonetic, setPhonetic] = useState<PhoneticContextValue | null>(null);

  const [trapActive, setTrapActive] = useState(false);

  const cancelTrap = useCallback(() => {
    // HACK: We need to restore focus manually after deactivating the trap.
    // Otherwise events happen in the wrong order and the editor becomes
    // convinced that it doesn't have focus, and the contextual popup vanishes.
    // It should not be possible to get into the contextual popup from anywhere
    // but the editor.
    setTrapActive(false);
    void Promise.resolve().then(() => {
      ReactEditor.focus(editor);
    });
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (Shortcut.matches(CloseKey, e)) {
      e.preventDefault();
      cancelTrap();
    }
  }, [cancelTrap]);

  useImperativeHandle(ref, () => ({
    contains: node => rootRef.current?.contains(node) || false,
    focus() {
      if (rootRef.current) {
        setTrapActive(true);
      }
    },
  }), []);

  useEffect(() => {
    const editorElem = editorRef.current;
    if (!editorElem) {
      return;
    }

    const nextLink = getLinkContextValue(editor, editorElem, link);
    if (nextLink !== link) {
      setLink(nextLink);
    }

    const nextPhonetic = getPhoneticContextValue(editor, editorElem, phonetic);
    if (nextPhonetic !== phonetic) {
      setPhonetic(nextPhonetic);
    }

    // If a focused popup is about to disappear, e.g. because the link it's for
    // was removed, we must deactivate the trap and refocus the editor.
    if (trapActive && !nextLink && !nextPhonetic) {
      cancelTrap();
    }
  });

  const placement = getPlacement(link?.placement, phonetic?.placement);

  if (!placement) {
    return null;
  }

  return (
    <S.Popup
      placement={placement}
      trapFocus={trapActive}
      aria-label='Contextual tools'
      onMouseDown={preventMouseFocus}
      onKeyDown={handleKeyDown}
      onPointerDownOutside={cancelTrap}
      ref={rootRef}
    >
      {link &&
        <LinkContext
          link={link.link}
          focusable={trapActive}
          onEditLink={onOpenLinkDialog}
        />}
      {phonetic &&
        <PhoneticContext
          range={phonetic.range}
          text={phonetic.text}
          focusable={trapActive}
          onInsertIpa={onOpenIpaDialog}
        />}
    </S.Popup>
  );
});

ContextualPopup.displayName = 'ContextualPopup';

export default ContextualPopup;
