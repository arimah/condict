import {Shortcut} from '@condict/ui';

export type InlineShortcuts = {
  readonly bold: Shortcut | null;
  readonly italic: Shortcut | null;
  readonly underline: Shortcut | null;
  readonly strikethrough: Shortcut | null;
  readonly subscript: Shortcut | null;
  readonly superscript: Shortcut | null;
};

export type BlockShortcuts = {
  readonly heading1: Shortcut | null;
  readonly heading2: Shortcut | null;
  readonly bulletList: Shortcut | null;
  readonly numberList: Shortcut | null;
  readonly indent: Shortcut | null;
  readonly unindent: Shortcut | null;
};

export type LinkShortcuts = {
  readonly addLink: Shortcut | null;
  readonly removeLink: Shortcut | null;
};

export type AllShortcuts = InlineShortcuts & BlockShortcuts & LinkShortcuts;

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
};

export default DefaultShortcuts;
