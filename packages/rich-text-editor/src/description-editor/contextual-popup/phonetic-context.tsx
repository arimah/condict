import React, {useCallback} from 'react';
import {Transforms, Editor, Node, Text, Range, Path} from 'slate';
import {ReactEditor} from 'slate-react';

import xsampaToIpa from '@condict/x-sampa';

import {useCondictEditor} from '../../plugin';
import {CondictEditor} from '../../types';

import {PlacementRect} from '../popup';
import {SearchIpaIcon, ConvertToIpaIcon} from '../icons';

import * as S from './styles';

export type Props = {
  range: Range;
};

const PhoneticPopup = (props: Props): JSX.Element | null => {
  const {range} = props;

  const editor = useCondictEditor();

  const text = Editor.string(editor, range);
  const ipa = xsampaToIpa(text);

  const applyConversion = useCallback(() => {
    const rangeRef = Editor.rangeRef(editor, range);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    Transforms.insertText(editor, ipa, {at: rangeRef.current!});
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    Transforms.select(editor, rangeRef.unref()!);
  }, [range]);

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
  readonly range: Range;
  readonly placement: PlacementRect;
}

const mightContainPhonetics = (text: string) => /[/[\]]/.test(text);

const getPhoneticsRange = (editor: Editor): Range | null => {
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

  const selStart = Range.start(selection).offset;
  const selEnd = Range.end(selection).offset;

  // Group 1: `[` preceded by a space or start-of-line, not followed by a space.
  //          Runs up to end-of-line or the first `]`. Square brackets do not
  //          generally occur within phonetic transcription, so X-SAMPA escapes
  //          are not relevant for those characters. Captures the content within
  //          the brackets.
  // Group 2: `/` preceded by a space or start-of-line, not followed by a space.
  //          Runs up to end-of-line, the first `[` or `]`, or the first `/`
  //          that *isn't* part of the sequence `_/`. `*` is recognised as an
  //          escape character, so `*_/` is treated as the literal character `_`
  //          followed by a terminating `/`. Likewise, `*/` is treated as a
  //          literal `/`, rather than a terminator. Captures the content within
  //          the slashes.
  const phoneticsPattern = /(?<=^|\s)(?:\[(?!\s)([^\]\r\n]*)(?:]|$)|\/(?!\s)((?:\*.|_\/|[^/[\]\r\n])*)(?:[[\]/]|$))/gm;

  let m: RegExpExecArray | null;
  while ((m = phoneticsPattern.exec(text.text))) {
    const group = m[1] != null ? m[1] : m[2];
    const matchStart = m.index + 1; // +1 to skip `[` or `/`
    const matchEnd = matchStart + group.length;
    if (matchStart > selEnd) {
      // We've passed the selection. Further groups could not possibly match.
      break;
    }

    if (matchStart <= selStart && selEnd <= matchEnd) {
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

  const domRange = ReactEditor.toDOMRange(editor, phoneticsRange);
  const rect = domRange.getBoundingClientRect();

  const editorRect = editorElem.getBoundingClientRect();

  const placement: PlacementRect = {
    x: rect.x - editorRect.x,
    y: rect.bottom - editorRect.y,
    parentWidth: editorRect.width,
  };
  // Prevent infinite update loops
  if (
    prev &&
    Range.equals(prev.range, phoneticsRange) &&
    PlacementRect.equals(prev.placement, placement)
  ) {
    return prev;
  }
  return {range: phoneticsRange, placement};
};
