# Toolbar

* [Examples](#examples)
* [`<Toolbar>`](#toolbar-1)
* [`<Toolbar.Button>`](#toolbarbutton)
* [`<Toolbar.Group>`](#toolbargroup)
* [`<Toolbar.MenuButton>`](#toolbarmenubutton)
* [`<Toolbar.RadioButton>`](#toolbarradiobutton)
* [`<Toolbar.RadioGroup>`](#toolbarradiogroup)
* [`<Toolbar.Select>`](#toolbarselect)
* [`<Toolbar.Spacer>`](#toolbarspacer)

---

The [`<Toolbar>`](#toolbar-1) component implements a generic toolbar. It defines various interactive components that should be used inside the toolbar. For the purposes of tab navigation, the toolbar is a single focusable element, and focus within the toolbar is managed by arrow keys.

## Examples

```jsx
import {Toolbar, Menu} from '@condict/ui';

// A simple toolbar with a few actions.
<Toolbar>
  <Toolbar.Button label='Undo' onClick={...}>
    <UndoIcon/>
  </Toolbar.Button>
  <Toolbar.Button label='Redo' onClick={...}>
    <RedoIcon/>
  </Toolbar.Button>

  <Toolbar.Group name='Edit'>
    <Toolbar.Button label='Cut' onClick={...}>
      <CutIcon/>
    </Toolbar.Button>
    <Toolbar.Button label='Copy' onClick={...}>
      <CopyIcon/>
    </Toolbar.Button>
    <Toolbar.Button label='Paste' onClick={...}>
      <PasteIcon/>
    </Toolbar.Button>
  </Toolbar.Group>
</Toolbar>

// A toolbar with toggle buttons bound to commands.
<Toolbar>
  <Toolbar.Button
    label='Bold'
    checked={...}
    command='toggleBold'
  >
    <BoldIcon/>
  </Toolbar.Button>
  <Toolbar.Button
    label='Italic'
    checked={...}
    command='toggleItalic'
  >
    <ItalicIcon/>
  </Toolbar.Button>
  <Toolbar.Button
    label='Underline'
    checked={...}
    command='toggleUnderline'
  >
  </Toolbar.Button>
</Toolbar>

// A toolbar with a menu button.
<Toolbar>
  <Toolbar.Group name='Edit'>
    ...
  </Toolbar.Group>
  <Toolbar.Spacer/>
  <Toolbar.MenuButton
    label='More options'
    menu={
      <Menu>
        ...
      </Menu>
    }
  >
    <DotsIcon/>
  </Toolbar.MenuButton>
</Toolbar>
```

## `<Toolbar>`

The `<Toolbar>` component is the outer container of a toolbar, which contains any number of toolbar items.

A toolbar should only use interactive items defined by the toolbar component – that is, [`<Toolbar.Button>`](#toolbarbutton), [`<Toolbar.MenuButton>`](#toolbarmenubutton), [`<Toolbar.RadioButton>`](#toolbarradiobutton), and [`<Toolbar.Select>`](#toolbarselect). This is because the toolbar manages its own focus and keyboard navigation for accessibility reasons.

Toolbars forward their ref to the underlying `<div>` element.

### Props

This component accepts the same props as a `<div>` element, except `role`, which is always set to `'toolbar'`. All props are forwarded to the underlying toolbar element.

## `<Toolbar.Button>`

A `<Toolbar.Button>` can represent either a regular clickable button, or a toggle button. If the `checked` prop is present and not undefined or null, it is a toggle button; otherwise, it is a regular button. You can attach a [command][] to a toolbar button, which overrides the `shortcut` and `onActivate` props. The command can also disable the toolbar button.

Toolbar buttons are designed to work with icons from the [mdi-react][] package exclusively. Icons from other packages will not be correctly aligned.

Toolbar buttons forward their ref to the underlying `<button>` element.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | string | `''` | One or more class names that are forwarded to the underlying element. |
| `checked` | boolean | `undefined` | If present and not null or undefined, the button becomes a toggle button, and this prop determines whether the toggle button is pressed. |
| `label` | string | `''` | A string value that contains the button's text. If used together with children, this value defines the button's accessible label. |
| `shortcut` | [Shortcut][] | `null` | The shortcut associated with the button. This value is used for display and accessibility only; it does not attach any behaviour. If the button has a [command][], this prop is ignored. |
| `disabled` | boolean | `false` | If true, the button is disabled. If the button has a [command][], the command can also disable the button. |
| `command` | string | `null` | Attaches the named [command][] to the button. The command overrides the `disabled`, `shortcut` and `onClick` props. |
| `onClick` | function | no-op | Attaches the `click` event handler to the button. If the button has a [command][], this prop is ignored. |
| `children` | node | `undefined` | The content of the button. If used together with `label`, this becomes the visible content of the button. |

Other props are forwarded to the underlying element.

## `<Toolbar.Group>`

A group of related toolbar components. The group is visually separated from other toolbar items, and can be given an accessible name.

Toolbar groups forward their ref to the underlying `<div>` element.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | string | `undefined` | If present, defines an accessible name of the group. |
| `children` | node | `undefined` | The content of the toolbar group. |

Other props are forwarded to the underlying element.

## `<Toolbar.MenuButton>`

A toolbar button that opens a menu when clicked. This is a utility component; the same effect could easily be achieved with a normal [`<Toolbar.Button>`](#toolbarbutton). This component uses a `<Toolbar.Button>` under the hood; see that component for additional details.

Unlike a regular or radio button, a menu button cannot have a [command][] attached, as clicking the button always opens a menu.

Menu buttons forward their ref to the underlying `<Toolbar.Button>`.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | string | `''` | One or more class names that are forwarded to the underlying element. |
| `disabled` | boolean | `false` | If true, the button is disabled. |
| `label` | string | `''` | A string value that contains the button's text. If used together with children, this value defines the button's accessible label. |
| `menu` | element | _none; required_ | The menu that this button opens. Any React element (but not other renderable, such as string, array or fragment) whose ref resolves to a [`<Menu>`](../menu#menu). Note that you _can_ use a custom component here, as long the ref is forwarded to a `<Menu>`. |
| `children` | node | `null` | The content of the button. If used together with `label`, this becomes the visible content of the button. |

Other props are forwarded to the underlying `<Toolbar.Button>`, but note that the menu button sets the `onClick` prop. Menu buttons should not have a shortcut.

## `<Toolbar.RadioButton>`

The `<Toolbar.RadioButton>` component specifically represents a pressable button in a group of exclusive options. It should be contained inside a [`<Toolbar.RadioGroup>`](#toolbarradiogroup) for accessibility. It behaves identically to a regular toolbar button in all but one respect: the `checked` prop defaults to `false`; undefined and null are not permitted, as a radio button is always either checked or unchecked.

Toolbar radio buttons do _not_ render an underlying `<input>` and so cannot be submitted as part of a form.

See [`<Toolbar.Button>`] for additional details.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | string | `''` | One or more class names that are forwarded to the underlying element. |
| `checked` | boolean | `undefined` | Determines whether the radio button is pressed. |
| `label` | string | `''` | A string value that contains the button's text. If used together with children, this value defines the button's accessible label. |
| `shortcut` | [Shortcut][] | `null` | The shortcut associated with the button. This value is used for display and accessibility only; it does not attach any behaviour. If the button has a [command][], this prop is ignored. |
| `disabled` | boolean | `false` | If true, the button is disabled. If the button has a [command][], the command can also disable the radio button. |
| `command` | string | `null` | Attaches the named [command][] to the button. The command overrides the `disabled`, `shortcut` and `onClick` props. |
| `onClick` | function | no-op | Attaches the `click` event handler to the button. If the button has a [command][], this prop is ignored. |
| `children` | node | `undefined` | The content of the button. If used together with `label`, this becomes the visible content of the button. |

Other props are forwarded to the underlying element.

## `<Toolbar.RadioGroup>`

This component groups a set of related [toolbar radio buttons](#toolbarradiobutton). In addition to providing a semantic grouping for accessibility, it also defines a key handler that allows up and down arrow keys to cycle through the radio buttons in the group.

The component renders a [`<Toolbar.Group>`](#toolbargroup); see that component's documentation for more details.

Toolbar radio groups forward their ref to the underlying `<Toolbar.Group>`.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | string | `undefined` | If present, defines an accessible name of the radio group. |
| `children` | node | _none; required_ | The content of the radio group. The only interactive elements in it should be [`<Toolbar.RadioButton>`](#toolbarradiobutton) components. |

Other props are forwarded to the underlying `<Toolbar.Group>`, but note that this component also sets the `role` and `onKeyDown` attributes.

## `<Toolbar.Select>`

This component renders a [`<Select>`](../select) surrounded by a `<label>`. Its behaviour is identical to the `<Select>` component. See that component's documentation for additional details.

The `<Toolbar.Select>` component forwards its ref to the underlying `<Select>`. It is not possible to capture the outer `<label>`.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | string | `''` | One or more class names that are forwarded to the underlying `<Select>`. |
| `label` | string | `undefined` | A text label that is shown before the dropdown. Depending on the design of the toolbar, a visible label may not be necessary. In that case, the dropdown should be given an `aria-label` or `aria-labelledby` that describes it for accessible technologies. |
| `value` | string | `''` | The currently selected value. This corresponds to the value of one of the dropdown options. Invalid values will clear the selection. |
| `options` | Array&lt;{name: string, value: string}&gt; | `null` | Provides options to the dropdown. Each option is an object with `name` and `value`, both strings. This cannot be combined with `children`. |
| `disabled` | boolean | `false` | If true, the dropdown is disabled. |
| `onChange` | function | no-op | Attaches the `change` event handler to the dropdown, which is triggered whenever the user changes the value. |
| `children` | node | `null` | Provides options to the dropdown. Any React renderable is permitted, as long as it renders valid `<option>` and/or `<optgroup>` elements. This cannot be combined with `options`. |

Other props are forwarded to the underlying `<Select>`.

## `<Toolbar.Spacer>`

A [styled component][styled-components] (by default a `<div>`) that stretches to fill available space. If a single spacer is used in a toolbar, everything after it will be right-aligned. If multiple spacers are used in the same toolbar, each will have the same size.

### Props

None declared. Accepts anything that can be given to a [styled component][styled-components].

[mdi-react]: https://www.npmjs.com/package/mdi-react
[styled-components]: https://www.styled-components.com/
[command]: ../command
[shortcut]: ../shortcut
