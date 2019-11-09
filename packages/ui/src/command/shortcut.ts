import {KeyboardEvent as SyntheticKeyboardEvent} from 'react';

import {selectPlatform, isMacOS} from '@condict/platform';

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
// read Ctrl with `getModifierState('Control')`.
//
// On macOS, the "primary" modifier is Cmd, which, JS being JS, is not actually
// mapped to `Control`, but to `Meta` (which on Windows may be the Windows key,
// and on Linux and Unix-likes possibly the Super key). In addition, macOS
// sometimes uses Ctrl as a "secondary" modifier.
//
// This is why we have a `primary` modifier instead of `ctrl`, so that we can
// select the most appropriate modifier for the system. The `secondary` modifier
// exists almost exclusively to support macOS, but also to allow user-typed
// shortcuts to use the Super/Windows key on Linux/Windows.
//
// It *is* possible to combine the primary and secondary modifiers (some
// shortcuts on macOS do that), but this is not portable behaviour and should
// be customised per OS.
//
// When parsing keyboard shortcut specifications, `Primary+` is taken to mean
// Cmd on macOS, and Ctrl elsewhere. `Secondary+` is Ctrl on macOS and the
// Super/Windows key elsewhere. `Ctrl+` and `Control+` mean Ctrl on every OS,
// and can be used to avoid platform-specific code.

type AnyKeyboardEvent = KeyboardEvent | SyntheticKeyboardEvent;

const hasPrimary = selectPlatform({
  macos: (e: AnyKeyboardEvent) => e.getModifierState('Meta'),
  windows: (e: AnyKeyboardEvent) =>
    e.getModifierState('Control') || e.getModifierState('AltGraph'),
  other: (e: AnyKeyboardEvent) => e.getModifierState('Control'),
});

const hasSecondary = selectPlatform({
  macos: (e: AnyKeyboardEvent) => e.getModifierState('Control'),
  default: (e: AnyKeyboardEvent) => e.getModifierState('OS'),
});

const hasAlt = selectPlatform({
  windows: (e: AnyKeyboardEvent) =>
    e.getModifierState('Alt') || e.getModifierState('AltGraph'),
  default: (e: AnyKeyboardEvent) => e.getModifierState('Alt'),
});

const modifiersPattern = /(Primary|Secondary|Shift|Alt|Ctrl|Control)\s*\+\s*/gi;

type ModifierFormatter =
  (primary: boolean, secondary: boolean, shift: boolean, alt: boolean) => string;

const joinMods = (
  a: false | string,
  b: false | string,
  c: false | string,
  d: false | string
) =>
  `${a || ''}${b || ''}${c || ''}${d || ''}`;

const formatModifiers: ModifierFormatter = selectPlatform({
  macos: (primary, secondary, shift, alt) =>
    // macOS order: Ctrl+Opt+Shift+Cmd+(key)
    // U+2325 = ⌥ Option Key
    // U+21E7 = ⇧ Upwards White Arrow, aka shift
    // U+2318 = ⌘ Place Of Interest Sign, aka Cmd
    // ^ = Ctrl
    joinMods(secondary && '^', alt && '\u2325', shift && '\u21E7', primary && '\u2318'),
  windows: (primary, secondary, shift, alt) =>
    // Windows order: Win+Ctrl+Alt+Shift+(key)
    joinMods(secondary && 'Win+', primary && 'Ctrl+', alt && 'Alt+', shift && 'Shift+'),
  other: (primary, secondary, shift, alt) =>
    // Linux order: Super+Ctrl+Alt+Shift+(key)
    joinMods(secondary && 'Super+', primary && 'Ctrl+', alt && 'Alt+', shift && 'Shift+'),
});

const formatAriaModifiers: ModifierFormatter = selectPlatform({
  macos: (primary, secondary, shift, alt) =>
    // Primary = Meta
    // Secondary = Control
    joinMods(primary && 'Meta+', secondary && 'Control+', alt && 'Alt+', shift && 'Shift+'),
  default: (primary, secondary, shift, alt) =>
    // Primary = Control
    // Secondary = Meta
    joinMods(primary && 'Control+', secondary && 'Meta+', alt && 'Alt+', shift && 'Shift+'),
});

// Translates a small number of special keys into a more palatable name.
// Some of these choices may be questionable.
const translateKeyName = (name: string) => {
  switch (name) {
    case ' ': return 'Space';
    case 'ArrowDown': return 'Down';
    case 'ArrowLeft': return 'Left';
    case 'ArrowRight': return 'Right';
    case 'ArrowUp': return 'Up';
    case 'Backspace': return 'Back';
    case 'Delete': return 'Del';
    case 'Escape': return 'Esc';
    case 'Insert': return 'Ins';
    default: return name;
  }
};

export type ShortcutConfig = {
  keys: string | string[];
  primary: boolean;
  secondary: boolean;
  shift: boolean;
  alt: boolean;
};

const DefaultConfig: ShortcutConfig = Object.freeze({
  keys: [],
  primary: false,
  secondary: false,
  shift: false,
  alt: false,
});

export type ShortcutType = Shortcut | ShortcutGroup;

export class Shortcut {
  public readonly keys: string[];
  public readonly primary: boolean;
  public readonly secondary: boolean;
  public readonly shift: boolean;
  public readonly alt: boolean;

  public constructor(config: Partial<ShortcutConfig>) {
    const fullConfig: ShortcutConfig = {...DefaultConfig, ...config};
    this.keys = Array.isArray(fullConfig.keys) ? fullConfig.keys : [fullConfig.keys];
    this.primary = fullConfig.primary;
    this.secondary = fullConfig.secondary;
    this.shift = fullConfig.shift;
    this.alt = fullConfig.alt;
  }

  public matches(keyEvent: AnyKeyboardEvent): boolean {
    return this.keys.includes(keyEvent.key) && this.testModifiers(keyEvent);
  }

  public testModifiers(keyEvent: AnyKeyboardEvent) {
    return (
      this.primary === hasPrimary(keyEvent) &&
      this.secondary === hasSecondary(keyEvent) &&
      this.shift === keyEvent.getModifierState('Shift') &&
      this.alt === hasAlt(keyEvent)
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
      this.primary,
      this.secondary,
      this.shift,
      this.alt
    );
    return `${modifiers}${translateKeyName(this.keys[0])}`;
  }

  public toAriaString(): string {
    const modifiers = formatAriaModifiers(
      this.primary,
      this.secondary,
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
          config.secondary = true;
          break;
        case 'shift':
          config.shift = true;
          break;
        case 'alt':
          config.alt = true;
          break;
        case 'ctrl':
        case 'control':
          if (isMacOS) {
            config.secondary = true;
          } else {
            config.primary = true;
          }
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

  public matches(keyEvent: AnyKeyboardEvent): boolean {
    return this.shortcuts.some(s => s.matches(keyEvent));
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
