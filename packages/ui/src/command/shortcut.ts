import {KeyboardEvent as SyntheticKeyboardEvent} from 'react';
import platform from 'platform';

// Keyboard shortcuts are *weird*.
//
// On most OSes, you have three modifiers that are primarily used for keyboard
// commands: Ctrl, Shift and Alt. On macOS computers, you have FOUR of the damn
// things: Cmd, Ctrl, Shift and Opt (or Alt).
//
// On most OSes, Ctrl is the "primary" modifier, and Shift and Alt are usually
// (but not exclusively) used in combination with Ctrl. Shift usually entails
// some notion of "moreness". Ctrl+W closes the current tab, Ctrl+Shift+W closes
// *every* tab. Shift also (universally, thankfully) extends selections. We can
// read Ctrl on the very useful `ctrlKey` property.
//
// On macOS, the "primary" modifier is Cmd, which, JS being JS, is not actually
// mapped to `ctrlKey`, but to `metaKey` (which on Windows is the Windows key,
// and on Linux and Unix-likes is the Super key (which we don't care about)).
// In addition, macOS sometimes uses Ctrl as a "secondary" modifier.
//
// This is why we have a `primary` modifier instead of `ctrl`, so that we can
// select the most appropriate modifier for the system. You can also specify
// `primary: SECONDARY`, as weird as that looks, to force Ctrl everywhere.
//
// You cannot combine the primary and secondary modifier. (macOS shortcuts
// sometimes do that, but the behaviour is not portable.)

type AnyKeyboardEvent = KeyboardEvent | SyntheticKeyboardEvent;

const isOSX: boolean =
  platform.os != null &&
  platform.os.family != null &&
  /os\s*x/.test(platform.os.family);

const hasPrimary = isOSX
  ? (e: AnyKeyboardEvent) => e.metaKey
  : (e: AnyKeyboardEvent) => e.ctrlKey;
const hasSecondary = (e: AnyKeyboardEvent) => e.ctrlKey;

const modifiersPattern = /(Primary|Secondary|Shift|Alt)\s*\+\s*/gi;

type ModifierFormatter =
  (primary: boolean, secondary: boolean, shift: boolean, alt: boolean) => string;

const formatModifiers: ModifierFormatter = isOSX
  ? (primary, secondary, shift, alt) =>
    // macOS order: Ctrl+Opt+Shift+Cmd+(key)
    // U+2325 = ⌥ Option Key
    // U+21E7 = ⇧ Upwards White Arrow, aka shift
    // U+2318 = ⌘ Place Of Interest Sign, aka Cmd
    // Ctrl doesn't have a symbol.
    `${secondary ? 'Ctrl+' : ''}${alt ? '\u2325' : ''}${shift ? '\u21E7' : ''}${primary ? '\u2318' : ''}`
  : (primary, secondary, shift, alt) =>
    // Windows/Linux order: Ctrl+Shift+Alt+(key)
    `${primary || secondary ? 'Ctrl+' : ''}${shift ? 'Shift+' : ''}${alt ? 'Alt+' : ''}`;

const formatAriaModifiers: ModifierFormatter = isOSX
  ? (primary, secondary, shift, alt) =>
    // Primary = Meta
    // Secondary = Control
    `${primary ? 'Meta+' : ''}${secondary ? 'Control+' : ''}${shift ? 'Shift+' : ''}${alt ? 'Alt+' : ''}`
  : (primary, secondary, shift, alt) =>
    // Primary = Control
    // Secondary = Control
    `${primary || secondary ? 'Control+' : ''}${shift ? 'Shift+' : ''}${alt ? 'Alt+' : ''}`;

export type ShortcutConfig = {
  keys: string | string[];
  primary: boolean | 'secondary';
  shift: boolean;
  alt: boolean;
};

const DefaultConfig: ShortcutConfig = Object.freeze({
  keys: [],
  primary: false,
  shift: false,
  alt: false,
});

export type ShortcutType = Shortcut | ShortcutGroup;

export class Shortcut {
  public static readonly SECONDARY = 'secondary';

  public readonly keys: string[];
  public readonly primary: boolean | 'secondary';
  public readonly shift: boolean;
  public readonly alt: boolean;

  public constructor(config: Partial<ShortcutConfig>) {
    const fullConfig: ShortcutConfig = {...DefaultConfig, ...config};
    this.keys = Array.isArray(fullConfig.keys) ? fullConfig.keys : [fullConfig.keys];
    this.primary = fullConfig.primary;
    this.shift = fullConfig.shift;
    this.alt = fullConfig.alt;
  }

  public testModifiers(keyEvent: AnyKeyboardEvent) {
    return (
      (
        this.primary === 'secondary' && hasSecondary(keyEvent) ||
        this.primary === hasPrimary(keyEvent)
      ) &&
      this.shift === keyEvent.shiftKey &&
      this.alt === keyEvent.altKey
    );
  }

  public forEach(cb: (shortcut: Shortcut, index: number) => void) {
    cb(this, 0);
  }

  public equals(other: ShortcutType | null | undefined): boolean {
    return (
      other instanceof Shortcut &&
      this.primary === other.primary &&
      this.shift === other.shift &&
      this.alt === other.alt &&
      this.keys.length === other.keys.length &&
      this.keys.reduce<boolean>(
        (eq, aKey, i) => eq && aKey === other.keys[i],
        true
      )
    );
  }

  public toString(): string {
    const modifiers = formatModifiers(
      this.primary === true,
      this.primary === 'secondary',
      this.shift,
      this.alt
    );
    return `${modifiers}${this.keys[0]}`;
  }

  public toAriaString(): string {
    const modifiers = formatAriaModifiers(
      this.primary === true,
      this.primary === 'secondary',
      this.shift,
      this.alt
    );
    const key = this.keys[0];
    const keyName = key === ' ' ? 'Space' : key;
    return `${modifiers}${keyName}`;
  }

  public static parse(shortcut: string): Shortcut;
  public static parse(shortcut: string[]): ShortcutGroup | null;
  public static parse(shortcut: string | string[]): ShortcutType | null {
    if (Array.isArray(shortcut)) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return ShortcutGroup.parse(shortcut);
    }

    const config: Partial<ShortcutConfig> = {};
    const keysString = shortcut.replace(modifiersPattern, (_, modifier) => {
      switch (modifier.toLowerCase()) {
        case 'primary':
          config.primary = true;
          break;
        case 'secondary':
          config.primary = 'secondary';
          break;
        case 'shift':
          config.shift = true;
          break;
        case 'alt':
          config.alt = true;
          break;
      }
      return '';
    });
    config.keys = keysString.split(/\s+/).filter(Boolean);
    return new Shortcut(config);
  }

  public static is(
    a: ShortcutType | null | undefined,
    b: ShortcutType | null | undefined
  ) {
    if (a == null || b == null) {
      return a == b;
    }
    return a.equals(b);
  }
}

export class ShortcutGroup {
  private readonly shortcuts: Shortcut[];

  public constructor(shortcuts: Shortcut[]) {
    this.shortcuts = shortcuts;
  }

  public forEach(cb: (shortcut: Shortcut, index: number) => void) {
    this.shortcuts.forEach(cb);
  }

  public equals(other: ShortcutType | null | undefined): boolean {
    return (
      other instanceof ShortcutGroup &&
      this.shortcuts.length === other.shortcuts.length &&
      this.shortcuts.reduce<boolean>(
        (eq, shortcut, i) => eq && shortcut.equals(other.shortcuts[i]),
        true
      )
    );
  }

  public toString(): string {
    return this.shortcuts[0].toString();
  }

  public toAriaString(): string {
    return this.shortcuts.map(s => s.toAriaString()).join(' ');
  }

  public static parse(shortcuts: string[]): ShortcutGroup | null {
    if (shortcuts.length === 0) {
      return null;
    }
    return new ShortcutGroup(shortcuts.map(s => Shortcut.parse(s)));
  }
}

type KeyMapEntry<C> = {
  command: C;
  shortcut: Shortcut;
};

function buildKeyMap<C>(
  commands: C[],
  getShortcut: (cmd: C) => ShortcutType | null
): Map<string, KeyMapEntry<C>[]> {
  const map = new Map<string, KeyMapEntry<C>[]>();

  commands.forEach(command => {
    const outerShortcut = getShortcut(command);
    if (!outerShortcut) {
      return;
    }

    // If this is a group, we need to walk through each of the group's members.
    outerShortcut.forEach(shortcut => {
      shortcut.keys.forEach(key => {
        let commandsForKey = map.get(key);
        if (!commandsForKey) {
          commandsForKey = [];
          map.set(key, commandsForKey);
        }
        commandsForKey.push({command, shortcut});
      });
    });
  });
  return map;
}

export class ShortcutMap<C> {
  private readonly keyMap: Map<string, KeyMapEntry<C>[]>;

  public constructor(
    commands: C[],
    getShortcut: (cmd: C) => ShortcutType | null
  ) {
    this.keyMap = buildKeyMap(commands, getShortcut);
  }

  public get(keyEvent: AnyKeyboardEvent): C | null {
    const commandsForKey = this.keyMap.get(keyEvent.key);
    if (!commandsForKey) {
      return null;
    }
    const item = commandsForKey.find(item =>
      item.shortcut.testModifiers(keyEvent)
    ) || null;
    return item && item.command;
  }
}
