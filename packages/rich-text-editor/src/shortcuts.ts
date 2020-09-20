import {Shortcut} from '@condict/ui';
import {isMacOS} from '@condict/platform';

export interface InlineShortcuts {
  /** Toggles bold. */
  readonly bold: Shortcut | null;
  /** Toggles italic. */
  readonly italic: Shortcut | null;
  /** Toggles underline. */
  readonly underline: Shortcut | null;
  /** Toggles strikethrough. */
  readonly strikethrough: Shortcut | null;
  /** Toggles subscript. */
  readonly subscript: Shortcut | null;
  /** Toggles superscript. */
  readonly superscript: Shortcut | null;
}

export interface BlockShortcuts {
  /** Formats the selected block(s) as a level 1 heading. */
  readonly heading1: Shortcut | null;
  /** Formats the selected block(s) as a level 2 heading. */
  readonly heading2: Shortcut | null;
  /** Formats the selected block(s) as a bullet list. */
  readonly bulletList: Shortcut | null;
  /** Formats the selected block(s) as a numbered list. */
  readonly numberList: Shortcut | null;
  /** Indents the selected block(s). */
  readonly indent: Shortcut | null;
  /** Unindents the selected block(s). */
  readonly unindent: Shortcut | null;
}

export interface LinkShortcuts {
  /** Wraps the selected text in a link, or edits the selected link. */
  readonly addLink: Shortcut | null;
  /** Removes links from the selected text. */
  readonly removeLink: Shortcut | null;
}

export interface HelperShortcuts {
  /** Opens the IPA input helper. */
  readonly insertIpa: Shortcut | null;
  /** Focuses the contextual popup. */
  readonly focusPopup: Shortcut | null;
}

export type AllShortcuts =
  InlineShortcuts &
  BlockShortcuts &
  LinkShortcuts &
  HelperShortcuts;

const DefaultShortcuts: AllShortcuts = {
  // Mark shortcuts
  bold: Shortcut.parse('Primary+B b'),
  italic: Shortcut.parse('Primary+I i'),
  underline: Shortcut.parse('Primary+U u'),
  strikethrough: Shortcut.parse('Primary+J j'),
  subscript: Shortcut.parse('Primary+H h'),
  superscript: Shortcut.parse('Primary+Shift+H h'),

  // Block shortcuts
  heading1: Shortcut.parse('Primary+1'),
  heading2: Shortcut.parse('Primary+2'),
  bulletList: Shortcut.parse('Primary+7'),
  numberList: Shortcut.parse('Primary+8'),
  indent: Shortcut.parse('Primary+. ] }'),
  unindent: Shortcut.parse('Primary+, [ {'),

  // Link shortcuts
  addLink: Shortcut.parse('Primary+K k'),
  removeLink: Shortcut.parse('Primary+Shift+K k'),

  // Helper shortcuts
  insertIpa: null,
  focusPopup: isMacOS
    // Cmd+M is "minimize window" and Cmd+Down is "go to end of document",
    // according to Wikipedia's _Table of keyboard shortcuts_.
    ? Shortcut.parse('Secondary+ArrowDown')
    : Shortcut.parse('Primary+ArrowDown M m'),
};

export default DefaultShortcuts;
