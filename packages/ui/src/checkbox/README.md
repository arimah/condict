# Checkbox

Unlike a standard HTML checkbox, the `<Checkbox>` component renders both the label (as a `<label>`) and the checkbox (as an `<input>`). The location of the check mark is controlled by the `marker` prop.

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
| `marker` | one of `'before'`, `'after'`, `'above'`, `'below'` | `'before'` | Sets the location of the checkbox marker (the checkable box itself) relative to the label. |
| `label` | string | `undefined` | A string value that contains the checkbox's text. If used together with children, this value defines the checkbox's accessible label. |
| `name` | string | `undefined` | The name of the checkbox, which is used if the checkbox is submitted as part of a form. |
| `labelProps` | object | `undefined` | An object of additional properties to pass on to the `<label>`. |
| `inputRef` | ref | `undefined` | Receives the underlying `<input>`. |
| `onChange` | function | no-op | Attaches the `change` event handler to the checkbox, which is triggered whenever the user changes the checkbox state. |
| `children` | node | `undefined` | The content of the checkbox label. If used together with `label`, this becomes the visible content of the checkbox. |

All other props are forwarded to the underlying `<input>`, which is a [styled component][styled-components].

## `Checkbox.Content`

The [styled component][styled-components] that wraps around the visible content of the checkbox. When styling a checkbox, this can be used to apply styles to the content wrapper. This is a `<span>`, so can only contain other inline elements. For example:

```jsx
import styled from 'styled-components';
import {Checkbox} from '@condict/ui';

const MyCheckbox = styled(Checkbox)`
  > ${Checkbox.Content} {
    display: flex:
    flex-direction: column;
    gap: 4px;
  }
`;
```

[styled-components]: https://www.styled-components.com/
