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
// and on Linux and Unix-likes is the Meta key (which we don't care about)). In
// addition, macOS sometimes uses Ctrl as a "secondary" modifier.
//
// This is why we have a `primary` modifier instead of `ctrl`, so that we can
// select the most appropriate modifier for the system. You can also specify
// `primary: SECONDARY`, as weird as that looks, to force Ctrl everywhere.
//
// You cannot combine the primary and secondary modifier. (macOS shortcuts
// sometimes do that, but the behaviour is not portable.)

const isOSX = /os\s*x/.test(platform.os.family);

const SECONDARY = 'secondary';

const hasPrimary = isOSX
  ? e => e.metaKey
  : e => e.ctrlKey;
const hasSecondary = e => e.ctrlKey;

const DefaultConfig = Object.freeze({
  key: [],
  primary: false,
  shift: false,
  alt: false,
});

const modifiersPattern = /(Primary|Secondary|Shift|Alt)\s*\+\s*/gi;

const formatModifiers = isOSX
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

export class Shortcut {
  constructor(config) {
    config = {...DefaultConfig, ...config};
    this.keys = Array.isArray(config.keys) ? config.keys : [config.keys];
    this.primary = config.primary;
    this.shift = config.shift;
    this.alt = config.alt;
  }

  testModifiers(keyEvent) {
    return (
      (
        this.primary === SECONDARY && hasSecondary(keyEvent) ||
        this.primary === hasPrimary(keyEvent)
      ) &&
      this.shift === keyEvent.shiftKey &&
      this.alt === keyEvent.altKey
    );
  }

  forEach(cb) {
    cb(this, 0);
  }

  equals(other) {
    return (
      other instanceof Shortcut &&
      this.primary === other.primary &&
      this.shift === other.shift &&
      this.alt === other.alt &&
      this.keys.length === other.keys.length &&
      this.keys.reduce((eq, aKey, i) => eq && aKey === other.keys[i], true)
    );
  }

  toString() {
    const modifiers = formatModifiers(
      this.primary === true,
      this.primary === SECONDARY,
      this.shift,
      this.alt
    );
    return `${modifiers}${this.keys[0]}`;
  }

  static parse(shortcut) {
    const config = {};
    const keysString = shortcut.replace(modifiersPattern, (_, modifier) => {
      switch (modifier.toLowerCase()) {
        case 'primary':
          config.primary = true;
          break;
        case 'secondary':
          config.secondary = SECONDARY;
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

  static is(a, b) {
    if (a == null || b == null) {
      return a == b;
    }
    return a.equals(b);
  }
}

Shortcut.SECONDARY = SECONDARY;

export class ShortcutGroup {
  constructor(shortcuts) {
    this.shortcuts = shortcuts;
  }

  forEach(cb) {
    this.shortcuts.forEach(cb);
  }

  equals(other) {
    return (
      other instanceof ShortcutGroup &&
      this.shortcuts.length === other.shortcuts.length &&
      this.shortcuts.reduce(
        (eq, shortcut, i) => eq && shortcut.equals(other.shortcuts[i]),
        true
      )
    );
  }

  toString() {
    return this.shortcuts[0].toString();
  }

  static parse(shortcuts) {
    if (shortcuts.length === 0) {
      return null;
    }
    return new ShortcutGroup(shortcuts.map(Shortcut.parse));
  }
}

const buildKeyMap = (commands, getShortcut) => {
  const map = new Map();
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
};

export class ShortcutMap {
  constructor(commands, getShortcut) {
    this.getShortcut = getShortcut;
    this.keyMap = buildKeyMap(commands, getShortcut);
  }

  get(keyEvent) {
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
