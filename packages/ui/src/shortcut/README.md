# Shortcut

* [Examples](#examples)
* [`Shortcut` functions](#shortcut-functions)
* [`ShortcutMap`](#shortcutmap)
* [`Shortcuts`](#shortcuts)
* [`<ShortcutFormatProvider>`](#shortcutformatprovider)
* [`<ShortcutName>`](#shortcutname)
* [`useShortcutFormatter()`](#useshortcutformatter)

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
| `ctrl`, `control` | <kbd>Ctrl</kbd> | <kbd>Ctrl</kbd> | <kbd>^ Ctrl</kbd> |
| `shift` | <kbd>Shift</kbd> | <kbd>Shift</kbd> | <kbd>⇧ Shift</kbd> |
| `alt` | <kbd>Alt</kbd> | <kbd>Alt</kbd> | <kbd>⌥ Option</kbd> |

The `Shortcut` type does not support key sequences, such as "Ctrl+K followed by Ctrl+M". The type _can_ represent groups of shortcuts with different modifiers, e.g. "Ctrl+K or Shift+F9". All functions below work on single shortcuts as well as shortcut groups.

## Examples

```jsx
import {Shortcut, ShortcutMap, Shortcuts, ShortcutName} from '@condict/ui';

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

// Display a formatted shortcut:
const MyTooltip = () =>
  <Tooltip>
    Undo (<ShortcutName of={Shortcuts.undo}/>)
  </Tooltip>
```

## `Shortcut` functions

* [`Shortcut.parse()`](#shortcutparse)
* [`Shortcut.matches()`](#shortcutmatches)
* [`Shortcut.testModifiers()`](#shortcuttestmodifiers)
* [`Shortcut.forEach()`](#shortcutforeach)
* [`Shortcut.equals()`](#shortcutequals)
* [`Shortcut.formatAria()`](#shortcutformataria)

### `Shortcut.parse`

> `Shortcut.parse(shortcutString: string | string[]): Shortcut | null`

Parses a string or array of strings into a `Shortcut`. A shortcut string contains any number of modifiers, followed by a space-separated list of [key values][key]. `Space` is recognized as a synonym for `' '`, which would not otherwise be possible.

The following modifiers are recognised:

* `Primary+` (<kbd>Ctrl</kbd> on Linux and Windows, <kbd>⌘ Command</kbd> on macOS);
* `Ctrl+` or `Control+` (<kbd>Ctrl</kbd>/<kbd>^ Ctrl</kbd> on every OS);
* `Shift+`;
* `Alt+` (<kbd>Alt</kbd> on Linux and Windows, <kbd>⌥ Option</kbd> on macOS).

Modifier case is insignificant. The order of modifiers is insignificant. Any amount of space is permitted between the modifier and the `+`, which is required.

Example values:

* `'Primary+Z z'`
* `'Primary+Shift+F12'`
* `'Shift+ +'`
* `['Ctrl+W', 'Primary+ A', 'Shift +S', 'Alt + D']`
* `'Ctrl + Alt + Delete'`

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

## `Shortcuts`

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

## `<ShortcutFormatProvider>`

This component is used to localize shortcut names that are displayed to the user.

Modifier keys are not named the same in all parts of the world. The <kbd>Ctrl</kbd> key is known in German as <kbd>Strg</kbd> (Steuerung); <kbd>Shift</kbd> is known in French as <kbd>Maj</kbd> (Majuscule). Non-modifier keys also have highly variable names: the <kbd>Backspace</kbd> key may be called _Rücktaste_, _Retour arrière_, _Retroceso_, 백스페이스, or any number of variations; arrow keys must be named; and so on. This component is used to provide shortcut localization.

**Note:** On macOS, the modifier keys are hardcoded. They always use the standard modifier symbols – ⌥ ⇧ ⌘ ⌃.

**Also note:** For `aria-keyshortcuts`, use [`Shortcut.formatAria()`](#shortcutformataria). The ARIA shortcut format is not locale-dependent.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `modifiers` | `ModifierNames` | _none; required_ | An object containing names for the modifier keys. |
| `translateKey` | function | _none; required_ | A function that receives a [key name value][key] and translates it to an appropriate name for the current locale. For example, `'ArrowUp'` may be translated to _Up_. The space character is sent as `'Space'`, not `' '`, for easier integration into localization systems. If a key does not need to be translated, the key name should be returned unchanged. |
| `children` | node | `undefined` | The provider's children. |

Other props are ignored.

## `<ShortcutName>`

This component renders a formatted shortcut name. If the given shortcut is a shortcut group (containing multiple shortcuts with potentially different modifiers), only the first is rendered. If the shortcut responds to multiple keys, the first is rendered. The shortcut is formatted using the nearest [shortcut format](#shortcutformatprovider).

The rendered element is always a fragment containing text only. It is not possible to style the shortcut name; place it inside a styled element instead.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `of` | [`Shortcut`](#shortcut) | _none; required_ | The shortcut to display. |

Other props are ignored.

## `useShortcutFormatter()`

> `useShortcutFormatter(): (shortcut: Shortcut) => string`

Acquires a shortcut formatter function from the nearest [shortcut format](#shortcutformatprovider). The function accepts a shortcut and returns a formatted shortcut string.

[key]: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
