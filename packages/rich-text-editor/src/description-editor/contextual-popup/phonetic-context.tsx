import React, {useCallback} from 'react';
import {Transforms, Editor, Node, Text, Range as SlateRange, Path} from 'slate';
import {ReactEditor} from 'slate-react';

import xsampaToIpa from '@condict/x-sampa';

import {useCondictEditor} from '../../plugin';
import {CondictEditor} from '../../types';

import {PlacementRect} from '../popup';
import {SearchIpaIcon, ConvertToIpaIcon} from '../icons';

import * as S from './styles';

export type Props = {
  range: SlateRange;
  text: string;
};

const PhoneticPopup = (props: Props): JSX.Element | null => {
  const {range, text} = props;

  const editor = useCondictEditor();

  const ipa = xsampaToIpa(text);

  const applyConversion = useCallback(() => {
    const rangeRef = Editor.rangeRef(editor, range);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    Transforms.insertText(editor, ipa, {at: rangeRef.current!});
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    Transforms.select(editor, rangeRef.unref()!);
  }, [range, ipa]);

  return (
    <S.Columns>
      {text !== ipa ? <>
        <S.PrimaryAction
          label={`Convert to IPA: ${ipa}`}
          onClick={applyConversion}
        >
          <ConvertToIpaIcon/>
          <S.PrimaryLabel>{ipa}</S.PrimaryLabel>
          <S.SecondaryLabel>Convert to IPA</S.SecondaryLabel>
        </S.PrimaryAction>
        <S.Actions>
          <S.Action
            label='Insert IPA character'
            title='Insert IPA character'
          >
            <SearchIpaIcon/>
          </S.Action>
        </S.Actions>
      </> : (
        <S.PrimaryAction>
          <SearchIpaIcon/>
          <span>Insert IPA character</span>
        </S.PrimaryAction>
      )}
    </S.Columns>
  );
};

export default PhoneticPopup;

export interface ContextValue {
  readonly range: SlateRange;
  readonly text: string;
  readonly placement: PlacementRect;
}

const mightContainPhonetics = (text: string) => /[/[\]]/.test(text);

const getPhoneticsRange = (editor: Editor): SlateRange | null => {
  const {selection} = editor;
  if (!selection) {
    return null;
  }

  // If the selection is collapsed, we try to find the phonetic transcription
  // block that the cursor is in, if any.
  // If the selection is *not* collapsed, it gets trickier. Currently, we don't
  // allow the selection to span multiple nodes. As long as it's all inside the
  // same Text, we try to find the phonetic transcription block, then suggest a
  // translation for the selected text only.
  if (!Path.equals(selection.focus.path, selection.anchor.path)) {
    // Selection spans multiple text nodes, can't handle right now.
    return null;
  }

  const text = Node.get(editor, selection.focus.path) as Text;
  if (!mightContainPhonetics(text.text)) {
    return null;
  }

  const selStart = SlateRange.start(selection).offset;
  const selEnd = SlateRange.end(selection).offset;

  // Group 1: `[` preceded by a space or start-of-line, not followed by a space.
  //          Runs up to end-of-line or the first `]`. Square brackets do not
  //          generally occur within phonetic transcription, so X-SAMPA escapes
  //          are not relevant for those characters. Captures the content within
  //          the brackets.
  // Group 2: The closing `]` for group 1, if there is one.
  // Group 3: `/` preceded by a space or start-of-line, not followed by a space.
  //          Runs up to end-of-line, the first `[` or `]`, or the first `/`
  //          that *isn't* part of the sequence `_/`. `*` is recognised as an
  //          escape character, so `*_/` is treated as the literal character `_`
  //          followed by a terminating `/`. Likewise, `*/` is treated as a
  //          literal `/`, rather than a terminator. Captures the content within
  //          the slashes.
  // Group 4: The closing `/` for group 3, if there is one.
  const phoneticsPattern = /(?<=^|\s)(?:\[(?!\s)([^\]\r\n]*)(]|$)|\/(?!\s)((?:\*.|_\/|[^/[\]\r\n])*)(\/|(?=[[\]])|$))/gm;

  let m: RegExpExecArray | null;
  while ((m = phoneticsPattern.exec(text.text))) {
    let group: string;
    let closing: string;
    if (m[1] != null) {
      group = m[1];
      closing = m[2];
    } else {
      group = m[3];
      closing = m[4];
    }

    const fullStart = m.index;
    const fullEnd = m.index + m[0].length;
    if (fullStart > selEnd) {
      // We've passed the selection. Further groups could not possibly match.
      break;
    }

    if (fullStart <= selStart && selEnd <= fullEnd) {
      const matchStart = fullStart + 1; // +1 to skip `[` or `/`
      // If there is no closing character, trim off trailing white space.
      // The X-SAMPA to IPA translation won't influence them anyway, and in
      // situations like `/foo [bar]`, they're not likely to be part of the
      // phonetic transcription.
      const matchEnd = closing
        ? matchStart + group.length
        : matchStart + group.trimEnd().length;

      const path = selection.focus.path;
      return {
        anchor: {path, offset: matchStart},
        focus: {path, offset: matchEnd},
      };
    }
  }

  return null;
};

export const getContextValue = (
  editor: CondictEditor,
  editorElem: HTMLDivElement,
  prev: ContextValue | null
): ContextValue | null => {
  const phoneticsRange = getPhoneticsRange(editor);
  if (!phoneticsRange) {
    return null;
  }

  let domRange: Range;
  try {
    // This call sometimes throws for mysterious reasons. In that case, there
    // isn't much we can do.
    domRange = ReactEditor.toDOMRange(editor, phoneticsRange);
  } catch (_e) {
    return null;
  }
  const rect = domRange.getBoundingClientRect();

  const editorRect = editorElem.getBoundingClientRect();

  const placement: PlacementRect = {
    x: rect.x - editorRect.x,
    y: rect.bottom - editorRect.y,
    parentWidth: editorRect.width,
  };

  const text = Editor.string(editor, phoneticsRange);
  // Prevent infinite update loops
  if (
    prev &&
    SlateRange.equals(prev.range, phoneticsRange) &&
    prev.text === text &&
    PlacementRect.equals(prev.placement, placement)
  ) {
    return prev;
  }
  return {
    range: phoneticsRange,
    text,
    placement,
  };
};
