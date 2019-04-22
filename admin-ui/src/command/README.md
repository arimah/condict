# Command

* [Examples](#examples)
* [`<CommandGroup>`](#commandgroup)
* [`<CommandConsumer>`](#commandconsumer)
* [`useCommand()`](#usecommand)
* [`Shortcut`](#shortcut)
* [`ShortcutGroup`](#shortcutgroup)
* [`ShortcutMap`](#shortcutmap)
* [`Shortcuts`](#shortcuts)

---

A _command_ is a reusable action. Every command is identified by a name, and has up to three properties:

* A callback that is invoked when the command is executed;
* Zero or more keyboard shortcuts that can be used to activate the command;
* An optional `disabled` value that indicates whether the command is currently unavailable (commands are enabled by default).

A [`<CommandGroup>`](#commandgroup) defines and groups related commands.

Commands can be attached to any component using a [`<CommandConsumer>`](#commandconsumer), or using the hook [`useCommand()`](#usecommand). The following components have built-in support for commands (via the `command` prop, which takes a command name):

* [Button](../button)
* [Menu.Item](../menu#menuitem)
* [Menu.CheckItem](../menu#menucheckitem)

## Examples

Define some commands using a [`<CommandGroup>`](#commandgroup):

```jsx
import {CommandGroup, Shortcuts} from '@condict/admin-ui';

// A pair of commands that update some component state, with shortcuts:
<CommandGroup
  commands={{
    undo: {
      exec: () => this.handleUndo(),
      disabled: !this.state.canUndo,
      shortcut: Shortcuts.undo,
    },
    redo: {
      exec: () => this.handleRedo(),
      disabled: !this.state.canRedo,
      shortcut: Shortcuts.redo,
    },
  }}
>
  {/* Command consumers go here */}
</CommandGroup>

// Use onExec to intercept commands being executed:
<CommandGroup
  commands={{
    toUpper: {
      exec: value => value.toUpperCase(),
    },
    toLower: {
      exec: value => value.toLowerCase(),
    },
  }}
  onExec={cmd => {
    // Pass an extra argument into the command, and use the return value.
    const nextValue = cmd.exec(this.state.value);
    this.setState({value: nextValue});
  }}
>
  {/* Command consumers go here */}
</CommandGroup>
```

Bind components to some commands using a [`<CommandConsumer>`](#commandconsumer) or the hook [`useCommand()`](#usecommand):

```jsx
import {CommandConsumer, useCommand} from '@condict/admin-ui';

// Bind to a single command using CommandConsumer:
<CommandConsumer name='undo'>
  {command =>
    <MyButton
      label='Undo'
      disabled={command.disabled}
      onClick={command.exec}
    />
  }
</CommandConsumer>

// Use useCommand to create a new component with command support:
const MyCommandButton = props => {
  const command = useCommand(props.command);

  return ...;
};
<MyCommandButton command='toUpper'>
  Convert to upper case
</MyCommandButton>
// equivalent to:
<CommandConsumer name='toUpper'>
  {command =>
    <MyButton command={command}>
      Convert to upper case
    </MyButton>
  }
</CommandConsumer>
```

## `<CommandGroup>`

A command group has two purposes: it defines a set of commands that can be used by child components; and it listens for key events in child components, so that it can activate keyboard shortcuts.

As a result of having to listen to key events, a `<CommandGroup>` renders a DOM element. It is not a "transparent" React element.

If a key event matches a command shortcut _and_ that command is enabled, the command group stops propagation of the key event and prevents the default behaviour. If the command or the group is disabled, the command group ignores the event, and it propagates upwards as usual. The command group can be passed an `onKeyDown` prop that receives unhandled key events.

A command group can contain any number of nested command groups. Commands are inherited from groups higher up in the tree. Nested commands can override inherited commands if given the same name. A [`<CommandConsumer>`](#commandconsumer) can reference commands from any parent group. See more under [examples](#examples).

### Command structure

The `commands` prop takes an object that defines the available commands. The key is the name of the command, and each value is an object. The following properties are recognised on the command object:

| Name | Type | Description |
| --- | --- | --- |
| `exec` | function | A function that is called when the command is executed. By default, this callback receives no arguments and the return value is ignored. However, the command group's `onExec` can intercept command executions and inject arguments and/or use the return value. See [props](#props) for details. |
| `shortcut` | string, Array&lt;string&gt;, [`Shortcut`](#shortcut) or [`ShortcutGroup`](#shortcutgroup) | Keyboard shortcuts attached to the command. Accepts a string, string array, `Shortcut` or `ShortcutGroup`. If the value is a string or array, it will be passed to [`Shortcut.parse()`](#shortcutparse); see that method for more details. If set to null or undefined, the command has no keyboard shortcut. |
| `disabled` | boolean | If true, the command is disabled. A disabled command cannot be triggered by its keyboard shortcut, and components that use it are automatically disabled. Commands are enabled by default. |

Any other properties on the command object are ignored and not passed to consumers.

See more under [examples](#examples).

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | string or component type | `'div'` | An HTML element name or a React component type that decides what the command group is rendered as. |
| `disabled` | boolean | `false` | If true, disables all commands in the group. Nested `<CommandConsumer>`s still receive their commands, and can invoke the `exec` function on the command irrespective of whether it's enabled. However, when the group is disabled, each command's `disabled` property will also be `true`. |
| `commands` | object | _none; required_ | Defines the command group's commands. See above for format and details. |
| `onExec` | function | `cmd => cmd.exec()` | A function that is called when a command is executed, whether by keyboard shortcut or by calling the command's `exec` function inside a `<CommandConsumer>`. It receives the command. The return value is ignored. The default value calls the command's `exec` function. |
| `onKeyDown` | function | `null` | Receives key events that were not handled by the shortcut key of any command. |
| `children` | node | `null` | Children that are passed to the command group element. |

All other props are forwarded to the inner element, whose type is specified by the `as` prop. The `disabled` prop is forwarded as well, since it is a standard HTML attribute.

**You can give `as` a custom component,** but you must ensure it takes an `onKeyDown` prop, and that it sends the `KeyboardEvent` as the first argument to the callback function. Basically, make sure it behaves like a DOM element.

The `onExec` function only receives commands defined by the group. Commands further down in the tree are delegated to their respective groups' `onExec` functions.

## `<CommandConsumer>`

A command consumer receives a single command as defined by a [command group](#commandgroup).

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | string | _none; required_ | The name of the command to bind to. |
| `children` | function | _none; required_ | A render function that receives the command, or null if the command does not exist. |

The command object passed to `children` has the following properties:

| Name | Type | Description |
| --- | --- | --- |
| `exec` | function | Executes the command. This function takes no arguments and returns no value. |
| `shortcut` | [`Shortcut`](#shortcut) or [`ShortcutGroup`](#shortcutgroup) | The keyboard shortcut(s) bound to the command. This should mainly be used for formatting a string description of the shortcut, such as "Ctrl+Z". |
| `disabled` | boolean | If true, the command is disabled. The bound component should be enabled or disabled according to this value. |

If the command's defining group has an `onExec` prop, then the bound command's `exec` function will delegate to the `onExec` function. Basically, you never have to worry about calling `onExec` yourself.

## `useCommand`

> `useCommand(name: ?string): command | null`

`useCommand()` is a [hook][hook] that translates a command name to a command object.

Given a command name, it attempts to resolve the name to a command object, which it returns. If the command cannot be found, or if the name is null or undefined, the hook returns null.

The command object has the same structure as the command passed to [`<CommandConsumer>`](#commandconsumer).

## `Shortcut`

* [constructor](#shortcut-constructor)
* [`Shortcut.prototype.forEach()`](#shortcutprototypeforeach)
* [`Shortcut.prototype.toString()`](#shortcutprototypetostring)
* [`Shortcut.prototype.toAriaString()`](#shortcutprototypetoariastring)
* [`Shortcut.parse()`](#shortcutparse)
* [`Shortcut.is()`](#shortcutis)
* [`Shortcut.SECONDARY`](#shortcutsecondary)

---

The `Shortcut` class represents a keyboard shortcut. A keyboard shortcut binds to one or more keys, along with any zero or more modifiers. Unfortunately, keyboard shortcuts are handled fairly inconsistently between platforms, and `Shortcut` attempts to be a kind of middle ground.

Note the following:

* Keys are bound to [the event's `key` value][key]. For named keys – such as the arrow keys, function keys, home/end/page up/page down keys, and so on – use the name of that key. All other keys use the _text_ produced by the key. For example, the key value `K` does not correspond to the position occupied by <kbd>K</kbd> on an American keyboard, but rather with the typed letter uppercase "K".
* The primary modifier is <kbd>⌘ Command</kbd> on macOS, but <kbd>Ctrl</kbd> everywhere else.
* macOS also has the secondary modifier <kbd>Ctrl</kbd>, which is not really present elsewhere.
* Linux has the <kbd>Super</kbd> key and Windows has the <kbd>Windows</kbd> key. These keys are rarely used by applications.
* Linux and Windows have <kbd>Alt</kbd>, while macOS has <kbd>⌥ Option</kbd>. These are not used the same way.
* <kbd>AltGr</kbd> exists and is highly inconsistent.

As a result, the `Shortcut` class has the following modifiers:

| Name | Linux | Windows | macOS |
| --- | --- | --- | --- |
| `primary` | <kbd>Ctrl</kbd> | <kbd>Ctrl</kbd> | <kbd>⌘ Command</kbd> when primary, <kbd>Ctrl</kbd> when secondary (see below) |
| `shift` | <kbd>Shift</kbd> | <kbd>Shift</kbd> | <kbd>⇧ Shift</kbd> |
| `alt` | <kbd>Alt</kbd> | <kbd>Alt</kbd> | <kbd>⌥ Option</kbd> |

When the `primary` modifier is set to [`Shortcut.SECONDARY`](#shortcutsecondary), the shortcut responds to <kbd>Ctrl</kbd> on every OS. When set to `true`, the shortcut responds to <kbd>Ctrl</kbd> on Linux and Windows, and <kbd>⌘ Command</kbd> on macOS. It is not possible to combine the primary and secondary modifier in the same shortcut, as that is not portable.

The `Shortcut` class does not support key sequences, such as "Ctrl+K followed by Ctrl+M".

### `Shortcut` constructor

> `constructor(fields: object): Shortcut`

Constructs a new `Shortcut`. `fields` is an object with the following keys:

| Name | Type | Description |
| --- | --- | --- |
| `keys` | string or Array&lt;string&gt; | A single [key value][key], or an array of key values. The shortcut will respond to the keys specified here. If you want to bind to a non-named key, such as <kbd>T</kbd>, it is strongly recommended to include both the uppercase and lowercase version, e.g. `['T', 't']`. The uppercase version should come first. |
| `primary` | boolean or [`Shortcut.SECONDARY`](#shortcutsecondary) | If `true`, the shortcut responds when the primary modifier is held. If set to [`Shortcut.SECONDARY`](#shortcutsecondary), the secondary modifier must be held. Finally, if set to `false`, both modifiers must be released. If omitted, this field defaults to `false`. |
| `shift` | boolean | If `true`, the <kbd>Shift</kbd> key must be held. Otherwise, it must be released. If omitted, this field defaults to `false`. |
| `alt` | boolean | If `true`, the <kbd>Alt</kbd> or <kbd>⌥ Option</kbd> key must be held. Otherwise, it must be released. If omitted, this field defaults to `false`. |

### `Shortcut.prototype.forEach`

> `forEach(cb: (shortcut: Shortcut, index: number) => any)`

Passes the `Shortcut` and the value `0` into `cb`. The return value of `cb` is ignored.

This function may seem useless on its own. It mirrors [`ShortcutGroup.prototype.forEach`](#shortcutgroupprototypeforeach), giving shortcuts and shortcut groups the same API.

### `Shortcut.prototype.toString`

> `toString(): string`

Formats the shortcut as a string, according to the platform's conventions. Notably, shortcuts are formatted differently on macOS. Some examples:

| Shortcut | macOS | Elsewhere |
| --- | --- | --- |
| Primary+T | `'⌘T'` | `'Ctrl+T'` |
| Primary+Shift+F | `'⇧⌘F'` | `'Ctrl+Shift+F'` |
| Alt+9 | `'⌥9'` | `'Alt+9'` |
| Secondary+Shift+P | `'Ctrl+⇧P'` | `'Ctrl+Shift+P'` |

If the shortcut responds to multiple keys, only the first key is included in the output.

### `Shortcut.prototype.toAriaString`

> `toAriaString(): string`

Formats the shortcut as an ARIA-compatible shortcut string. If the shortcut repsonds to multiple keys, only the first key is included in the output.

### `Shortcut.parse`

> `static parse(value: string | Array<string>): Shortcut | ShortcutGroup`

Parses a string into a `Shortcut`, or an array of strings into a `ShortcutGroup`. A shortcut string contains any number of modifiers, followed by a space-separated list of [key values][key].

The following modifiers are recognised:

* `Primary+` (<kbd>Ctrl</kbd> on Linux and Windows, <kbd>⌘ Command</kbd> on macOS);
* `Secondary+` (<kbd>Ctrl</kbd> on every OS);
* `Shift+`;
* `Alt+` (<kbd>Alt</kbd> on Linux and Windows, <kbd>⌥ Option</kbd> on macOS).

Case is insignificant. The order of modifiers is insignificant. Any amount of space is permitted between the modifier and the `+`, which is required. You cannot combine `Primary+` and `Secondary+`.

Examples:

* `Shortcut.parse('Primary+Home')` is equivalent to `new Shortcut({keys: 'Home', primary: true})`
* `Shortcut.parse('Secondary+Shift+ArrowUp')` is equivalent to `new Shortcut({keys: 'ArrowUp', primary: Shortcut.SECONDARY, shift: true})`
* `Shortcut.parse(['Primary+L l', 'End'])` is equivalent to `new ShortcutGroup([new Shortcut({keys: ['L', 'l'], primary: true}), new Shortcut({keys: 'End'})])`

### `Shortcut.is`

> `static is(a: any, b: any): boolean`

Determines whether two shortcuts or shortcut groups are equivalent. Two shortcuts are equivalent if they have the same keys in the same order, and the same modifiers. Two shortcut groups are equivalent if they contain equivalent shortcuts. If either value is null or undefined, the result is true if both are null or undefined.

### `Shortcut.SECONDARY`

> `static SECONDARY = 'secondary';`

When this value is passed to the `primary` field in [the constructor](#shortcut-constructor), indicates that the secondary modifier should be used, rather than the primary.

## `ShortcutGroup`

* [constructor](#shortcutgroup-constructor)
* [`ShortcutGroup.prototype.forEach()`](#shortcutgroupprototypeforeach)
* [`ShortcutGroup.prototype.toString()`](#shortcutgroupprototypetostring)
* [`ShortcutGroup.prototype.toAriaString()`](#shortcutgroupprototypetoariastring)

---

A `ShortcutGroup` combines multiple [`Shortcut`](#shortcut) values. While a `Shortcut` can be bound to multiple keys, they must all use the same modifiers. Using a `Shortcut` alone, it is not possible to specify both `Primary+ArrowLeft` and `Home`; that is what `ShortcutGroup` is for.

See [`Shortcut`](#shortcut) for more details on keys, modifiers, and other concerns.

### `ShortcutGroup` constructor

> `constructor(shortcuts: Array<Shortcut>): ShortcutGroup`

Constructs a new `ShortcutGroup`. `shortcuts` is an array of [`Shortcut`](#shortcut) values.

Note that each value must be `Shortcut`, not a string. To parse an array of strings into a `ShortcutGroup`, use [`Shortcut.parse`](#shortcut-parse).

### `ShortcutGroup.prototype.forEach`

> `forEach(cb: (shortcut: Shortcut, index: number) => any)`

Passes each `Shortcut` in the group and its associated index into `cb`. The return value of `cb` is ignored.

### `ShortcutGroup.prototype.toString`

> `toString(): string`

Formats the _first shortcut_ in the shortcut group as a string. See [`Shortcut.prototype.toString()`](#shortcutprototypetostring) for details.

**Note:** The output only includes the first shortcut in the group.

### `Shortcut.prototype.toAriaString`

> `toAriaString(): string`

Formats each shortcut in the group as an ARIA-compatible shortcut string. See [`Shortcut.prototype.toAriaString()`](#shortcutprototypetoariastring) for details.

## `ShortcutMap`

* [constructor](#shortcutmap-constructor)
* [`ShortcutMap.prototype.get()`](#shortcutmapprototypeget)

---

The `ShortcutMap` class contains an efficient mapping from a [`Shortcut`](#shortcut) to an arbitrary value (typically a command). The shortcut map can then be used to look up values from a keyboard event.

### `ShortcutMap` constructor

> `constructor<T>(values: Array<T>, getShortcut: (value: T) => Shortcut | ShortcutGroup): ShortcutMap<T>`  
> (where `T` is the type of the values stored in the map)

Constructs a new `ShortcutMap` with the specified values. When given one of the values, the `getShortcut` function returns the shortcut or shortcut group that the value is bound to, or null if it has no shortcut.

### `ShortcutMap.prototype.get`

> `get(event: KeyboardEvent): ?T`  
> (where `T` is the type of the values stored in the map)

Finds a value whose shortcut can handle the keyboard event. If there is no matching value, returns null.

## `Shortcuts`

An object that defines various common shortcuts. The following shortcuts are defined:

| Name | Linux | Windows | macOs |
| --- | --- | --- | --- |
| `undo` | <kbd>Ctrl</kbd>+<kbd>Z</kbd> | <kbd>Ctrl</kbd>+<kbd>Z</kbd> | <kbd>⌘ Command</kbd>+<kbd>Z</kbd> |
| `redo` | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> | <kbd>Ctrl</kbd>+<kbd>Y</kbd> | <kbd>⇧ Shift</kbd>+<kbd>⌘ Command</kbd>+<kbd>Z</kbd> |

These keyboard shortcuts are largely standardised, and should not be used for other meanings.

[hook]: https://reactjs.org/docs/hooks-intro.html
[key]: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
