# Checkbox

Unlike a standard HTML checkbox, the `<Checkbox>` component renders both the label (as a `<label>`) and the checkbox (as an `<input>`). It is currently not possible to configure the placement of the check mark; it always comes before the label.

The `<Checkbox>` component may be used as a controlled or uncontrolled component.

Checkboxes do _not_ forward refs to any underlying element. Use the `inputRef` prop to capture the `<input>`.

## Examples

```jsx
import {Checkbox} from '@condict/ui';

// A simple checkbox with a label.
<Checkbox label='Enable things' checked={...} onChange={...}/>

// An indeterminate checkbox with rendered content.
<Checkbox
  indeterminate
  onChange={...}
>
  Enable laughing time
</Checkbox>

// A checkbox for a dangerous action, with a name that can be sent
// along with a form.
<Checkbox
  label='Delete all children'
  name='deleteChildren'
  intent='danger'
  checked={...}
  onChange={...}
/>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | string | `undefined` | One or more class names that are forwarded to the checkbox _label_. |
| `checked` | boolean | `undefined` | Determines whether the checkbox is checked. |
| `indeterminate` | boolean | `false` | If true, the checkbox is put in an indeterminate, i.e. half-checked, state. If set to true, the value of `checked` is ignored, but should probably be set to `true`. |
| `disabled` | boolean | `false` | If true, the checkbox is disabled. |
| `intent` | one of `'general'`, `'accent'`, `'danger'` | `'accent'` | Determines what intent styling to give the checkbox. Unchecked checkboxes look identical regardless of intent. |
| `label` | string | `undefined` | A string value that contains the checkbox's text. If used together with children, this value defines the checkbox's accessible label. |
| `name` | string | `undefined` | The name of the checkbox, which is used if the checkbox is submitted as part of a form. |
| `labelProps` | object | `undefined` | An object of additional properties to pass on to the `<label>`. |
| `inputRef` | ref | `undefined` | Receives the underlying `<input>`. |
| `onChange` | function | no-op | Attaches the `change` event handler to the checkbox, which is triggered whenever the user changes the checkbox state. |
| `children` | node | `undefined` | The content of the checkbox label. If used together with `label`, this becomes the visible content of the checkbox. |

All other props are forwarded to the underlying `<input>`, which is a [styled component][styled-components].

[styled-components]: https://www.styled-components.com/
