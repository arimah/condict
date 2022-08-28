# Select

The `<Select>` component is a thin wrapper around the HTML `<select>` element. Its behaviour is identical to the native element. It is a dropdown, not a combo box; you cannot type into it. For appearance reasons, this component puts a wrapper `<span>` around the `<select>` element.

Options can be specified in one of two ways:

* Through the `options` prop, which takes an array of objects containing a `name` and a `value`.
* By providing children to the `<Select>`, in the form of `<option>` and `<optgroup>` elements.

You cannot combine both approaches in the same dropdown.

Selects forward their ref to the underlying `<select>`. You cannot capture the wrapper `<span>`.

## Examples

```jsx
import {Select} from '@condict/ui';

// A dropdown that uses the `options` prop.
const MyOptions = [
  {name: 'London', value: 'london'},
  {name: 'Paris', value: 'paris'},
  {name: 'New York City', value: 'nyc'},
];
<Select
  options={MyOptions}
  value={...}
  onChange={...}
/>

// An equivalent dropdown that uses children.
<Select value={...} onChange={...}>
  <option value='london'>London</option>
  <option value='paris'>Paris</option>
  <option value='nyc'>New York City</option>
</Select>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | string | `''` | One or more class names that are forwarded to the dropdown's wrapper (a `<span>`). |
| `value` | string | `''` | The currently selected value. This corresponds to the value of one of the dropdown options. Invalid values will clear the selection. |
| `options` | Array&lt;{name: string, value: string}&gt; | `null` | Provides options to the dropdown. Each option is an object with `name` and `value`, both strings. This cannot be combined with `children`. |
| `minimal` | boolean | `false` | If true, applies minimal styling to the dropdown. |
| `disabled` | boolean | `false` | If true, the dropdown is disabled. |
| `onChange` | function | no-op | Attaches the `change` event handler to the dropdown, which is triggered whenever the user changes the value. |
| `children` | node | `null` | Provides options to the dropdown. Any React renderable is permitted, as long as it renders valid `<option>` and/or `<optgroup>` elements. This cannot be combined with `options`. |

All other props are forwarded to the underlying `<select>`, which is a [styled component][styled-components].

[styled-components]: https://www.styled-components.com/
