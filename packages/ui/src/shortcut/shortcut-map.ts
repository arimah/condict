import {KeyboardEvent as SyntheticKeyboardEvent} from 'react';

import {Shortcut, SingleShortcut} from './shortcut';

type AnyKeyboardEvent = KeyboardEvent | SyntheticKeyboardEvent;

interface KeyMapEntry<C> {
  readonly command: C;
  readonly shortcut: SingleShortcut;
}

type KeyMapEntries<C> = readonly KeyMapEntry<C>[];

function buildKeyMap<C>(
  commands: C[],
  getShortcut: (cmd: C) => Shortcut | null
): Map<string, KeyMapEntries<C>> {
  const map = new Map<string, KeyMapEntry<C>[]>();

  for (const command of commands) {
    const outer = getShortcut(command);
    if (!outer) {
      break;
    }

    // If this is a group, we need to walk through each of the group's members.
    Shortcut.forEach(outer, shortcut => {
      for (const key of shortcut.keys) {
        let commandsForKey = map.get(key);
        if (!commandsForKey) {
          commandsForKey = [];
          map.set(key, commandsForKey);
        }
        commandsForKey.push({command, shortcut});
      }
    });
  }
  return map;
}

export default class ShortcutMap<C> {
  private readonly keyMap: Map<string, KeyMapEntries<C>>;

  public constructor(
    commands: C[],
    getShortcut: (cmd: C) => Shortcut | null
  ) {
    this.keyMap = buildKeyMap(commands, getShortcut);
  }

  public get(keyEvent: AnyKeyboardEvent): C | null {
    const commandsForKey = this.keyMap.get(keyEvent.key);
    if (!commandsForKey) {
      return null;
    }
    const item = commandsForKey.find(item =>
      Shortcut.testModifiers(item.shortcut, keyEvent)
    );
    return item ? item.command : null;
  }
}
