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
// This is why we have a `primary` modifier: to select the most appropriate
// "primary" modifier for the system. When Ctrl is desired everywhere, we use
// `ctrl`.
//
// It *is* possible to combine `primary` and `ctrl` modifiers (some shortcuts
// on macOS do that), but this is not portable behaviour and should absolutely
// be customised per OS.
//
// When parsing keyboard shortcut specifications, `Primary+` is taken to mean
// Cmd on macOS, and Ctrl elsewhere. `Ctrl+` and `Control+` mean Ctrl on every
// OS, and can be used to avoid platform-specific code.

/**
 * A single shortcut. It may respond to multiple keys, but modifiers are the
 * same for all keys.
 */
export interface SingleShortcut {
  /** Keys that the shortcut responds to.  */
  readonly keys: string[];
  /** True if the primary modifier must be pressed. */
  readonly primary: boolean;
  /** True if the secondary modifier must be pressed (macOS only). */
  readonly secondary: boolean;
  /** True if Shift must be pressed. */
  readonly shift: boolean;
  /** True if Alt (Windows, Linux) or Opt (macOS) must be pressed. */
  readonly alt: boolean;
  /** Not used. */
  readonly shortcuts?: undefined;
}

/**
 * A shortcut group, which combines many shortcuts that may have different
 * modifier states.
 */
export interface ShortcutGroup {
  readonly shortcuts: readonly SingleShortcut[];
}

export type Shortcut = SingleShortcut | ShortcutGroup;

type AnyKeyboardEvent = KeyboardEvent | SyntheticKeyboardEvent;

const ModifiersPattern = /(Primary|Shift|Alt|Ctrl|Control)\s*\+\s*/gi;

// Allow 'Space' as a synonym for ' '; otherwise it doesn't work with
// Shortcut.parse().
const normalizeKey = (key: string): string => key === 'Space' ? ' ' : key;

export const Shortcut = {
  parse(shortcutStrings: string | string[]): Shortcut {
    if (!Array.isArray(shortcutStrings)) {
      shortcutStrings = [shortcutStrings];
    }

    const shortcuts = shortcutStrings
      .map((text: string): SingleShortcut => {
        let primary = false;
        let secondary = false;
        let shift = false;
        let alt = false;
        const keysString = text.replace(ModifiersPattern, (_, mod: string) => {
          switch (mod.toLowerCase()) {
            case 'primary':
              primary = true;
              break;
            case 'shift':
              shift = true;
              break;
            case 'alt':
              alt = true;
              break;
            case 'ctrl':
            case 'control':
              if (isMacOS) {
                secondary = true;
              } else {
                primary = true;
              }
              break;
          }
          return '';
        });
        const keys = keysString
          .split(/\s+/)
          .map(normalizeKey)
          .filter(Boolean);
        return {keys, primary, secondary, shift, alt};
      })
      .filter(shortcut => shortcut.keys.length > 0);

    if (shortcuts.length === 1) {
      return shortcuts[0];
    }
    return {shortcuts};
  },

  matches(shortcut: Shortcut, event: AnyKeyboardEvent): boolean {
    if (shortcut.shortcuts) {
      return shortcut.shortcuts.some(s => Shortcut.matches(s, event));
    }
    return (
      shortcut.keys.includes(event.key) &&
      Shortcut.testModifiers(shortcut, event)
    );
  },

  testModifiers(shortcut: SingleShortcut, event: AnyKeyboardEvent): boolean {
    return (
      shortcut.primary === hasPrimary(event) &&
      shortcut.secondary === hasSecondary(event) &&
      shortcut.shift === event.getModifierState('Shift') &&
      shortcut.alt === hasAlt(event)
    );
  },

  forEach(
    shortcut: Shortcut,
    cb: (shortcut: SingleShortcut, index: number) => void
  ): void {
    if (shortcut.shortcuts) {
      shortcut.shortcuts.forEach(cb);
    } else {
      cb(shortcut, 0);
    }
  },

  equals(
    a: Shortcut | null | undefined,
    b: Shortcut | null | undefined
  ): boolean {
    if (a == null || b == null) {
      return a == null && b == null;
    }

    if (a === b) {
      return true;
    }

    if (a.shortcuts) {
      if (!b.shortcuts) {
        return false;
      }
      return (
        a.shortcuts.length === b.shortcuts.length &&
        a.shortcuts.every((s, i) => singleEquals(s, b.shortcuts[i]))
      );
    } else {
      if (b.shortcuts) {
        return false;
      }
      return singleEquals(a, b);
    }
  },

  formatAria(shortcut: Shortcut): string {
    if (shortcut.shortcuts) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      return shortcut.shortcuts.map(Shortcut.formatAria).join(' ');
    }

    const modifiers = formatAriaModifiers(shortcut);
    const key = shortcut.keys[0];
    const keyName = key === ' ' ? 'Space' : key;
    return `${modifiers}${keyName}`;
  },
} as const;

const hasPrimary = selectPlatform({
  macos: (e: AnyKeyboardEvent) => e.getModifierState('Meta'),
  windows: (e: AnyKeyboardEvent) =>
    e.getModifierState('Control') || e.getModifierState('AltGraph'),
  other: (e: AnyKeyboardEvent) => e.getModifierState('Control'),
});

const hasSecondary = selectPlatform({
  macos: (e: AnyKeyboardEvent) => e.getModifierState('Control'),
  default: () => false,
});

const hasAlt = selectPlatform({
  windows: (e: AnyKeyboardEvent) =>
    e.getModifierState('Alt') || e.getModifierState('AltGraph'),
  default: (e: AnyKeyboardEvent) => e.getModifierState('Alt'),
});

const singleEquals = (a: SingleShortcut, b: SingleShortcut): boolean =>
  a.primary === b.primary &&
  a.secondary === b.secondary &&
  a.shift === b.shift &&
  a.alt === b.alt &&
  a.keys.length === b.keys.length &&
  a.keys.every((key, i) => b.keys[i] === key);

type ModifierFormatter = (shortcut: SingleShortcut) => string;

const formatAriaModifiers: ModifierFormatter = selectPlatform({
  macos: ({primary, secondary, shift, alt}) =>
    // Primary = Meta
    // Secondary = Control
    (primary ? 'Meta+' : '') +
    (secondary ? 'Control+' : '') +
    (alt ? 'Alt+' : '') +
    (shift ? 'Shift+' : ''),
  default: ({primary, shift, alt}) =>
    // Primary = Control
    // Secondary = absent
    (primary ? 'Control+' : '') +
    (alt ? 'Alt+' : '') +
    (shift ? 'Shift+' : ''),
});
