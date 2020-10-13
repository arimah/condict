# Command

* [Examples](#examples)
* [`useCommandGroup()`](#usecommandgroup)
* [`CommandGroup`](#commandgroup)
* [`<CommandProvider>`](#commandprovider)
* [`useCommand()`](#usecommand)
* [`<CommandConsumer>`](#commandconsumer)

---

A _command_ is a reusable action. Every command is identified by a name, and has up to three properties:

* A value that identifies the command action, typically a callback;
* Zero or more [keyboard shortcuts][shortcut] that can be used to activate the command;
* An optional `disabled` value that indicates whether the command is currently unavailable (commands are enabled by default).

The [`useCommandGroup()`](#usecommandgroup) hook defines a [group of reusable commands](#commandgroup), while the [`<CommandProvider>`](#commandprovider) component makes them available to child components.

Commands can be attached to any component using a [`<CommandConsumer>`](#commandconsumer), or using the hook [`useCommand()`](#usecommand). The following components have built-in support for commands (via the `command` prop, which takes a command name):

* [Button](../button)
* [Menu.Item](../menu#menuitem)
* [Menu.CheckItem](../menu#menucheckitem)
* [Toolbar.Button](../toolbar#toolbarbutton)
* [Toolbar.RadioButton](../toolbar#toolbarradiobutton)

If you only wish to associate functionality with keyboard shortcuts, and not expose named commands to child components, consider using a [`ShortcutMap`](../shortcut#shortcutmap) instead.

## Examples

Define some commands with [`useCommandGroup()`](#usecommandgroup) and expose them with [`<CommandProvider>`](#commandprovider):

```jsx
import {CommandGroup, CommandProvider, Shortcuts} from '@condict/ui';

// A pair of commands that update some component state, with shortcuts:
const commands = useCommandGroup({
  commands: {
    undo: {
      exec: () => handleUndo(),
      disabled: !canUndo,
      shortcut: Shortcuts.undo,
    },
    redo: {
      exec: () => handleRedo(),
      disabled: !canRedo,
      shortcut: Shortcuts.redo,
    },
  },
  exec: cmd => cmd(),
});
<div onKeyDown={e => { CommandGroup.handleKey(commands, e); }}>
  <CommandProvider commands={commands}>
    {/* Command consumers go here */}
  </CommandProvider>
</div>

// Passing values into the command's exec function:
const commands = useCommandGroup({
  commands: {
    toUpper: {
      exec: value => value.toUpperCase(),
    },
    toLower: {
      exec: value => value.toLowerCase(),
    },
  },
  exec: cmd => setValue(cmd(value)),
});
<CommandProvider commands={commands}>
  {/* Command consumers go here */}
</CommandProvider>
```

Bind components to some commands using a [`<CommandConsumer>`](#commandconsumer) or the hook [`useCommand()`](#usecommand):

```jsx
import {CommandConsumer, useCommand} from '@condict/ui';

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
  return (
    <MyButton disabled={command.disabled} onClick={command.exec}>
      ...
    </MyButton>
  );
};
<MyCommandButton command='toUpper'>
  ...
</MyCommandButton>
// equivalent to:
<CommandConsumer name='toUpper'>
  {command =>
    <MyButton disabled={command.disabled} onClick={command.exec}>
      ...
    </MyButton>
  }
</CommandConsumer>
```

## `useCommandGroup`

> `useCommandGroup<T>(options: CommandGroupOptions<T>): CommandGroup`

This [hook][] creates a command group with the specified commands, executor and optional disabled status. On its own, a [`CommandGroup`](#commandgroup) does not do anything. It must be exposed to consumers with a [`<CommandProvider>`](#commandprovider). Shortcut keys must be listened to manually; the helper function [`CommandGroup.handleKey()`](#commandgrouphandlekey) takes care of this.

The options object passed to the hook contains three properties:

| Name | Type | Description |
| --- | --- | --- |
| `commands` | `CommandSpecMap<T>` | An object containing the commands in the group. The key is the name of the command, and the value is the command itself. See [command structure](#command-structure) below for details. |
| `exec` | function | A function that executes the commands. It receives the command's `action`. The return value is ignored. |
| `disabled` | boolean | If true, all commands in the group are disabled. Invidiual commands can be disabled as well. This property is optional; if omitted, it defaults to `false`. |

### Command structure

The `commands` prop takes an object that defines the available commands. The key is the name of the command, and each value is an object. The following properties are recognised on the command object:

| Name | Type | Description |
| --- | --- | --- |
| `action` | any | A value that contains the command's action, typically a function. The command group's `exec` prop is responsible for handling this value. See [`useCommandGroup()`](#usecommandgroup) above for details. |
| `shortcut` | string, string[], [`Shortcut`][shortcut], null or undefined | Keyboard shortcuts attached to the command. If the value is a string or array, it will be passed to [`Shortcut.parse()`][shortcutparse]; see that function for more details. If set to null or undefined, the command has no keyboard shortcut. |
| `disabled` | boolean | If true, the command is disabled. A disabled command cannot be triggered by its keyboard shortcut, and components that use it are automatically disabled. Commands are enabled by default. |

Any other properties on the command object are ignored.

See more under [examples](#examples).

## `CommandGroup`

> `type CommandGroup`  
> `const CommandGroup`

The `CommandGroup` type contains a mapping from command name to command object, as well as a shortcut lookup map. The exported constant contains a few helper functions for working with command groups:

* [`CommandGroup.get()`](#commandgroupget)
* [`CommandGroup.exec()`](#commandgroupexec)
* [`CommandGroup.handleKey()`](#commandgrouphandlekey)

---

### `CommandGroup.get`

> `CommandGroup.get(group: CommandGroup, name: string): Command | null`

Gets the command with the specified name. If the group has no command of that name, returns null.

### `CommandGroup.exec`

> `CommandGroup.exec(group: CommandGroup, name: string): boolean`

Executes the command with the specified name. If the command is disabled, this function is a no-op. Returns true if the command was found and executed; false if the command could not be found or the command was disabled.

### `CommandGroup.handleKey`

> `CommandGroup.handleKey(group: CommandGroup, e: KeyboardEvent): boolean`

Executes the command whose shortcut matches a key event.

If the keyboard event has had its default prevented (`e.defaultPrevented` is true), this function is a no-op. If a matching command is found and executed, this function calls `e.preventDefault()`.

Returns true if the keyboard event was handled (the event was not already handled, a command was found, and the command was not disabled); false if the event was already handled, no command was found, or the command was disabled.

## `<CommandProvider>`

The `<CommandProvider>` component exposes commands to child components. Commands can only be accessed by [`useCommand()`](#usecommand) or [`<CommandConsumer>`](#commandconsumer) when mounted inside a `<CommandProvider>`.

Command groups can be arbitrarily nested. Commands are inherited from groups higher up in the tree. Nested commands can override inherited commands if given the same name. The [`useCommand()`](#usecommand) hook and [`<CommandConsumer>`](#commandconsumer) can reference commands from any parent group. See more under [examples](#examples).

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `commands` | [`CommandGroup`](#commandgroup) | _none; required_ | The command group to expose. |
| `children` | node | `undefined` | The command provider's children. |

Other props are ignored.

## `useCommand`

> `useCommand(name: string | undefined | null): Command | null`

`useCommand()` is a [hook][] that translates a command name to a command object.

Given a command name, it attempts to resolve the name to a command object, which it returns. If the command cannot be found, or if the name is null, the hook returns null. The command must be exposed to the component by a [`<CommandProvider>`](#commandprovider).

The returned command object has the following properties:

| Name | Type | Description |
| --- | --- | --- |
| `exec` | function | Executes the command. This function takes no arguments and returns no value. |
| `shortcut` | [`Shortcut`][shortcut] or null | The keyboard shortcut(s) bound to the command. This should mainly be used for formatting a string description of the shortcut. |
| `disabled` | boolean | If true, the command is disabled. The component that uses the command should be enabled or disabled according to this value. |

The command object has the same structure as the command passed to [`<CommandConsumer>`](#commandconsumer).

## `<CommandConsumer>`

A command consumer receives a single command as defined by a [command group](#usecommandgroup). This component resolves commands in the same way as [`useCommand()`](#usecommand); see there for more details.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | string | _none; required_ | The name of the command to bind to. |
| `children` | function | _none; required_ | A render function that receives the command, or null if the command could not be found. |

The command object passed to `children` has the same properties as the value returned by [`useCommand()`](#usecommand).

[hook]: https://reactjs.org/docs/hooks-intro.html
[shortcut]: ../shortcut
[shortcutmap]: ../shortcut#shortcutmap
[shortcutparse]: ../shortcut#shortcutparse
