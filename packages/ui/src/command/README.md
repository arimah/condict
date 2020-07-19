# Command

* [Examples](#examples)
* [`<CommandGroup>`](#commandgroup)
* [`<CommandConsumer>`](#commandconsumer)
* [`useCommand()`](#usecommand)

---

A _command_ is a reusable action. Every command is identified by a name, and has up to three properties:

* A callback that is invoked when the command is executed;
* Zero or more [keyboard shortcuts][shortcut] that can be used to activate the command;
* An optional `disabled` value that indicates whether the command is currently unavailable (commands are enabled by default).

A [`<CommandGroup>`](#commandgroup) defines and groups related commands.

Commands can be attached to any component using a [`<CommandConsumer>`](#commandconsumer), or using the hook [`useCommand()`](#usecommand). The following components have built-in support for commands (via the `command` prop, which takes a command name):

* [Button](../button)
* [Menu.Item](../menu#menuitem)
* [Menu.CheckItem](../menu#menucheckitem)
* [Toolbar.Button](../toolbar#toolbarbutton)
* [Toolbar.RadioButton](../toolbar#toolbarradiobutton)

## Examples

Define some commands using a [`<CommandGroup>`](#commandgroup):

```jsx
import {CommandGroup, Shortcuts} from '@condict/ui';

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
| `shortcut` | string, string[], [`Shortcut`][shortcut], null or undefined | Keyboard shortcuts attached to the command. If the value is a string or array, it will be passed to [`Shortcut.parse()`][shortcutparse]; see that function for more details. If set to null or undefined, the command has no keyboard shortcut. |
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
| `shortcut` | [`Shortcut`][shortcut] or null | The keyboard shortcut(s) bound to the command. This should mainly be used for formatting a string description of the shortcut, such as "Ctrl+Z". |
| `disabled` | boolean | If true, the command is disabled. The bound component should be enabled or disabled according to this value. |

If the command's defining group has an `onExec` prop, then the bound command's `exec` function will delegate to the `onExec` function. Basically, you never have to worry about calling `onExec` yourself.

## `useCommand`

> `useCommand(name: string | null): BoundCommand | null`

`useCommand()` is a [hook][hook] that translates a command name to a command object.

Given a command name, it attempts to resolve the name to a command object, which it returns. If the command cannot be found, or if the name is null, the hook returns null.

The command object has the same structure as the command passed to [`<CommandConsumer>`](#commandconsumer).

[hook]: https://reactjs.org/docs/hooks-intro.html
[shortcut]: ../shortcut
[shortcutparse]: ../shortcut#shortcutparse
