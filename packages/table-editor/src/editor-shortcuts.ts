import {Shortcut, ShortcutMap} from '@condict/ui';

export type EditorCommandType = 'commit';

type EditorCommand = {
  shortcut: Shortcut | null;
  command: EditorCommandType;
};

const EditorShortcuts = new ShortcutMap<EditorCommand>(
  [
    {
      shortcut: Shortcut.parse('Enter Escape'),
      command: 'commit',
    },
  ],
  cmd => cmd.shortcut
);

export default EditorShortcuts;
