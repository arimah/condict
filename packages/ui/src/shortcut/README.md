# Shortcut

* [Examples](#examples)
* [`Shortcut` functions](#shortcut-functions)
* [`ShortcutMap`](#shortcutmap)
* [`Shortcuts`](#shortcuts)

---

The `Shortcut` type represents a keyboard shortcut. A keyboard shortcut binds to one or more keys, along with zero or more modifiers. Unfortunately, keyboard shortcuts are handled fairly inconsistently between platforms, and `Shortcut` attempts to be a kind of middle ground.

Note the following:

* Keys are bound to [the event's `key` value][key]. For named keys – such as the arrow keys, function keys, home/end/page up/page down keys, and so on – use the name of that key. All other keys use the _text_ produced by the key. For example, the key value `K` does not correspond to the position occupied by <kbd>K</kbd> on an American keyboard, but rather with the typed letter uppercase "K", which may be anywhere at all, or absent. Key values are case sensitive.
* The primary modifier is <kbd>⌘ Command</kbd> on macOS, but <kbd>Ctrl</kbd> everywhere else.
* macOS also has the secondary modifier <kbd>Ctrl</kbd>, which is not really present elsewhere.
* Linux has the <kbd>Super</kbd> key and Windows has the <kbd>Windows</kbd> key. These keys are rarely used by applications.
* Linux and Windows have <kbd>Alt</kbd>, while macOS has <kbd>⌥ Option</kbd>. These are not used the same way.
* <kbd>AltGr</kbd> exists and is highly inconsistent.

As a result, the `Shortcut` type has the following modifiers:

| Name | Linux | Windows | macOS |
| --- | --- | --- | --- |
| `primary` | <kbd>Ctrl</kbd> | <kbd>Ctrl</kbd> | <kbd>⌘ Command</kbd> |
| `secondary` | <kbd>Super</kbd> | <kbd>Windows</kbd> | <kbd>^ Ctrl</kbd> |
| `shift` | <kbd>Shift</kbd> | <kbd>Shift</kbd> | <kbd>⇧ Shift</kbd> |
| `alt` | <kbd>Alt</kbd> | <kbd>Alt</kbd> | <kbd>⌥ Option</kbd> |

The `Shortcut` type does not support key sequences, such as "Ctrl+K followed by Ctrl+M". The type _can_ represent groups of shortcuts with different modifiers, e.g. "Ctrl+K or Shift+F9". All functions below work on single shortcuts as well as shortcut groups.

## Examples

```jsx
import {Shortcut, ShortcutMap} from '@condict/ui';

const NavigationCommands = new ShortcutMap(
  [
    // Shortcuts that reponds to exactly one key:
    {
      shortcut: Shortcut.parse('Home'),
      action: 'start',
    },
    {
      shortcut: Shortcut.parse('End'),
      action: 'end',
    },
    // Shortcuts that respond to multiple keys:
    {
      shortcut: Shortcut.parse('ArrowUp ArrowLeft')
      action: 'prev',
    },
    {
      shortcut: Shortcut.parse('ArrowDown ArrowRight'),
      action: 'next',
    },
    // Shortcuts that respond to groups of keys with different modifiers:
    {
      shortcut: Shortcut.parse(['PageUp', 'Shift+ArrowUp ArrowLeft']),
      action: 'prevPage',
    },
    {
      shortcut: Shortcut.parse(['PageDown', 'Shift+ArrowDown ArrowRight']),
      action: 'nextPage',
    },
  ],
  // Callback defines how to get the shortcut for each command:
  cmd => cmd.shortcut
);

// A lone shortcut outside a shortcut map:
const Escape = Shortcut.parse('Escape');

// Handle shortcuts in a component's key events:
const MyComponent = () =>
  <div
    onKeyDown={e => {
      // Test a single shortcut:
      if (Shortcut.matches(Escape, e)) {
        e.stopPropagation();
        closeSomething();
        return;
      }

      // Look up a command in a ShortcutMap:
      const command = NavigationCommands.get(e);
      if (e) {
        e.preventDefault();
        switch (e.action) {
          ...
        }
      }
    }}
  >
    ...
  </div>;
```

## `Shortcut` functions

* [`Shortcut.parse()`](#shortcutparse)
* [`Shortcut.matches()`](#shortcutmatches)
* [`Shortcut.testModifiers()`](#shortcuttestmodifiers)
* [`Shortcut.forEach()`](#shortcutforeach)
* [`Shortcut.equals()`](#shortcutequals)
* [`Shortcut.format()`](#shortcutformat)
* [`Shortcut.formatAria()`](#shortcutformataria)

### `Shortcut.parse`

> `Shortcut.parse(shortcutString: string | string[]): Shortcut | null`

Parses a string into a `Shortcut`, or an array of strings into a `ShortcutGroup`. A shortcut string contains any number of modifiers, followed by a space-separated list of [key values][key].

The following modifiers are recognised:

* `Primary+` (<kbd>Ctrl</kbd> on Linux and Windows, <kbd>⌘ Command</kbd> on macOS);
* `Secondary+` (<kbd>Ctrl</kbd> on macOS, <kbd>Super</kbd> on Linux, <kbd>Windows</kbd> on Windows);
* `Ctrl+` or `Control+` (<kbd>Ctrl</kbd> on every OS);
* `Shift+`;
* `Alt+` (<kbd>Alt</kbd> on Linux and Windows, <kbd>⌥ Option</kbd> on macOS).

Modifier case is insignificant. The order of modifiers is insignificant. Any amount of space is permitted between the modifier and the `+`, which is required.

Example values:

* `'Primary+Z z'`
* `'Primary+Shift+F12'`
* `'Shift+ +'`
* `['Ctrl+W', 'Primary+ A', 'Shift +S', 'Alt + D']`
* `'Ctrl + Alt + Delete'`.

### `Shortcut.matches`

> `Shortcut.matches(shortcut: Shortcut, event: KeyboardEvent): boolean`

Determines whether the shortcut matches the specified event. The keyboard event can be a synthetic React event or a native keyboard event. This function tests the shortcut's key(s) as well as modifiers against the event.

### `Shortcut.testModifiers`

> `Shortcut.testModifiers(shortcut: Shortcut, event: KeyboardEvent): boolean`

Determines whether the shortcut's modifiers match the specified event. The keyboard event can be a synthetic React event or a native keyboard event. This function is mainly intended for internal use.

### `Shortcut.forEach`

> `Shortcut.forEach(shortcut: Shortcut, cb: (shortcut: SingleShortcut, index: number) => void): void`

Invokes the specified callback for each shortcut. If `shortcut` is a group, the callback receives each shortcut in that group; if `shortcut` is a single shortcut, it is passed to the callback.

### `Shortcut.equals`

> `Shortcut.equals(a: Shortcut | null | undefined, b: Shortcut | null | undefined): boolean`

Determines whether two shortcuts are equal. The two shortcuts are equivalent if:

* Both are null or undefined;
* Both are shortcut groups of the same length where all shortcuts are equal;
* Both are single shortcuts with the same keys and modifiers.

### `Shortcut.format`

> `Shortcut.format(shortcut: Shortcut): string`

Formats the shortcut into a user-friendly string. The exact format varies depending on platform. Some examples:

| Shortcut | Linux | Windows | macOS |
| --- | --- | --- | --- |
| Primary+T | `'Ctrl+T'` | `'Ctrl+T'` | `'⌘T'` |
| Primary+Shift+F | `'Ctrl+Shift+F'` | `'Ctrl+Shift+F'` | `'⇧⌘F'` |
| Alt+9 | `'Alt+9'` | `'Alt+9'` | `'⌥9'` |
| Secondary+Shift+P | `'Win+Shift+P'` | `'Super+Shift+P'` | `'^⇧P'` |

If the shortcut responds to multiple keys, only the first is included in the output.

### `Shortcut.formatAria`

> `Shortcut.formatAria(shortcut: Shortcut): string`

Formats the shortcut as an ARIA-compatible shortcut string. If the shortcut repsonds to multiple keys, only the first key is included in the output. If the shortcut is a group, all of its shortcuts are included.

## `ShortcutMap`

* [constructor](#shortcutmap-constructor)
* [`ShortcutMap.prototype.get()`](#shortcutmapprototypeget)

---

The generic class `ShortcutMap<T>` contains an efficient mapping from a [`Shortcut`](#shortcut) or [`ShortcutGroup`](#shortcutgroup) to an arbitrary value `T` (which is typically some kind of command). The shortcut map can then be used to look up values from a keyboard event.

### `ShortcutMap` constructor

> `constructor(values: Array<T>, getShortcut: (value: T) => Shortcut | null): ShortcutMap<T>`  
> (where `T` is the type of the values stored in the map)

Constructs a new `ShortcutMap<T>` with the specified values. The `getShortcut` function should return the shortcut or shortcut group for each value in the map, or null if it has no shortcut.

### `ShortcutMap.prototype.get`

> `get(event: KeyboardEvent): T | null`  
> (where `T` is the type of the values stored in the map)

Finds a value whose shortcut can handle the keyboard event. If there is no matching value, returns null. The keyboard event can be a synthetic React event or a native keyboard event.

### `Shortcuts`

An object that defines various common shortcuts. The following shortcuts are defined:

| Name | Linux | Windows | macOs |
| --- | --- | --- | --- |
| `undo` | <kbd>Ctrl</kbd>+<kbd>Z</kbd> | <kbd>Ctrl</kbd>+<kbd>Z</kbd> | <kbd>⌘ Command</kbd>+<kbd>Z</kbd> |
| `redo` | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> | <kbd>Ctrl</kbd>+<kbd>Y</kbd> | <kbd>⇧ Shift</kbd>+<kbd>⌘ Command</kbd>+<kbd>Z</kbd> |
| `cut` | <kbd>Ctrl</kbd>+<kbd>X</kbd> | <kbd>Ctrl</kbd>+<kbd>X</kbd> | <kbd>⌘ Command</kbd>+<kbd>X</kbd> |
| `copy` | <kbd>Ctrl</kbd>+<kbd>C</kbd> | <kbd>Ctrl</kbd>+<kbd>C</kbd> | <kbd>⌘ Command</kbd>+<kbd>C</kbd> |
| `paste` | <kbd>Ctrl</kbd>+<kbd>V</kbd> | <kbd>Ctrl</kbd>+<kbd>V</kbd> | <kbd>⌘ Command</kbd>+<kbd>V</kbd> |
| `selectAll` | <kbd>Ctrl</kbd>+<kbd>A</kbd> | <kbd>Ctrl</kbd>+<kbd>A</kbd> | <kbd>⌘ Command</kbd>+<kbd>A</kbd> |

These keyboard shortcuts are largely standardised, and should not be used for other meanings.

[key]: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
