# Buttons

A button can be rendered either as a `<button>` (using [`<Button>`](#button)) or as an `<a>` (using [`<LinkButton>`](#linkbutton).

## `<Button>`

Buttons have support for [commands][command], via the `command` prop. When a button has a command, the `onClick` prop is set by the command. The command can also disable the button.

Buttons forward their ref to the underlying element, which is a `<button>`.

### Examples

```jsx
import {Button, LinkButton} from '@condict/ui';

// A simple button with a label.
<Button onClick={...}>
  Show me what you got
</Button>

// A link button with more complex children.
<LinkButton href={aboutUri} target='_blank'>
  <InfoIcon/> About the competition
</LinkButton>

// A slim, bold button that mixes rendered content and ARIA label.
// The label is exposed to assistive technologies, like screen readers.
<Button slim intent='bold' aria-label='Undo' onClick={...}>
  <UndoIcon/>
</Button>

// A button that performs a dangerous action
<Button intent='danger' onClick={...}>
  Delete the whole thing
</Button>

// A submit button. Since it submits a form when clicked, it does
// not require an onClick handler.
<Button type='submit'>Save</Button>
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | string | `''` | One or more class names that are forwarded to the underlying element. |
| `disabled` | boolean | `false` | If true, the button is disabled. This prop has no effect on link buttons. If the button has a [command][], the command can also disable the button. |
| `intent` | one of `'general'`, `'accent'`, `'bold'`, `'danger'`, `'naked'` | `'general'` | Determines the button's colour, which helps communicate its intent. The `naked` intent causes a button to blend into the background; use this extremely sparingly, as it is often hard to identify these as buttons outside a narrow range of contexts. |
| `slim` | boolean | `false` | If true, reduce the button's padding, to make it fit better alongside text inputs, selects, and similar. |
| `type` | one of `'button'`, `'submit'` | `'button'` | Determines the button's type. Submit buttons are used in forms. This prop has no effect on link buttons. |
| `command` | string | `null` | Attaches the named [command][] to the button. The command overrides the `disabled` and `onClick` props. |
| `onClick` | function | no-op | Attaches the `click` event handler to the button. If the button has a [command][], this prop is ignored. |
| `children` | node | `null` | The content of the button. |

All other props are forwarded to the underlying element, which is a [styled component][styled-components] containing a `<button>`.

## `<LinkButton>`

Link buttons have support for [commands][command], via the `command` prop. When a button has a command, the `onClick` prop is set by the command. Additionally, although link buttons cannot be disabled, when an attached command is disabled, the `onClick` prop is set to a no-op that cancels the event.

Link buttons forward their ref to the underlying element, which is an `<a>`.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `href` | string | _none; required_ | The URL that the link button points to. |
| `className` | string | `''` | One or more class names that are forwarded to the underlying element. |
| `intent` | one of `'general'`, `'accent'`, `'bold'`, `'danger'` | `'general'` | Determines what intent styling to give the button. |
| `slim` | boolean | `false` | If true, reduce the button's padding, to make it fit better alongside text inputs, selects, and similar. |
| `command` | string | `null` | Attaches the named [command][] to the button. The command overrides the `onClick` prop. |
| `onClick` | function | no-op | Attaches the `click` event handler to the button. If the button has a [command][], this prop is ignored. |
| `children` | node | `null` | The content of the button. |

All other props are forwarded to the underlying element, which is a [styled component][styled-components] containing an `<a>`.

[command]: ../command
[styled-components]: https://www.styled-components.com/
