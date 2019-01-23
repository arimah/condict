# Button

A button can be rendered either as a `<button>` (the default) or, when given an `href` prop, as an `<a>`. Link buttons behave like normal buttons in all but two respects:

* The `disabled` prop does nothing, even when set by a [command][].
* The `type` prop is not applicable, so has no effect.

Buttons have support for [commands][command], via the `command` prop. When a button has a command, the `disabled` and `onClick` props have no effect.

Buttons forward their ref to the underlying element.

## Examples

```jsx
import {Button} from '@condict/admin-ui';

// A simple button with a label.
<Button label='Show me what you got' onClick={...}/>

// A link button with rendered children.
<Button href={aboutUri} target='_blank'>
  <InfoIcon/> About the competition
</Button>

// A slim, secondary button that mixes rendered content and label.
// The label is exposed to assistive technologies, like screen readers.
<Button slim intent='secondary' label='Undo' onClick={...}>
  <UndoIcon/>
</Button>

// A minimal button that performs a dangerous action
<Button minimal intent='danger' onClick={...}>
  Delete the whole thing
</Button>

// A submit button. Since it submits a form when clicked, it does
// not require an onClick handler.
<Button type='submit' label='Save'/>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | string | `''` | One or more class names that are forwarded to the underlying element. |
| `disabled` | boolean | `false` | If true, the button is disabled. This prop has no effect on link buttons. If the button has a [command][], this prop is ignored. |
| `minimal` | boolean | `false` | If true, applies minimal styling to the button. Basically, it removes the background. |
| `intent` | one of `'primary'`, `'secondary'`, `'danger'` | `'primary'` | Determines what intent styling to give the button. |
| `slim` | boolean | `false` | If true, reduce the button's padding, to make it fit better alongside text inputs, selects, and similar. |
| `label` | string | `''` | A string value that contains the button's text. If used together with children, this value defines the button's accessible label. |
| `href` | string | `null` | If set, turns the button into a link button. The `disabled` and `type` props have no effect on link buttons. |
| `type` | one of `'button'`, `'submit'` | `'button'` | Determines the button's type. Submit buttons are used in forms. This prop has no effect on link buttons. |
| `command` | string | `null` | Attaches the named [command][] to the button. The command overrides the `disabled` and `onClick` props. |
| `onClick` | function | no-op | Attaches the `click` event handler to the button. If the button has a [command][], this prop is ignored. |
| `children` | node | `null` | The content of the button. If used together with `label`, this becomes the visible content of the button. |

All other props are forwarded to the underlying element, which is a [styled component][styled-components] containing either a `<button>` or an `<a>`.

[command]: ../command
[styled-components]: https://www.styled-components.com/
