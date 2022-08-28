# Input

* [Examples](#examples)
* [`<TextInput>`](#textinput)
* [`<NumberInput>`](#numberinput)

## Examples

```jsx
import {NumberInput, TextInput} from '@condict/ui';

// A minimal URL input.
<TextInput
  value={...}
  type='url'
  placeholder='Image address'
  minimal
  onChange={...}
/>

// A search input with a keydown handler.
<TextInput
  value={...}
  type='search'
  placeholder='Search products, categories, ...'
  onChange={...}
  onKeyDown={...}
/>

// A basic number input.
<NumberInput
  value={...}
  placeholder='Enter a percentage'
  min={0}
  max={100}
  step={0.1}
  onChange={...}
/>
```

## `<TextInput>`

This component renders a standard `<input>` of a text type (by default, `text`).

Text inputs forward their ref to the underlying element.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | string | `''` | One or more class names that are forwarded to the input. |
| `type` | one of `'email'`, `'password'`, `'search'`, `'tel'`, `'text'`, `'url'` | `'text'` | The input type. |
| `value` | string | `''` | The value of the input. |
| `placeholder` | string | `undefined` | The input's placeholder text, shown when the input is empty. |
| `minLength` | number | `undefined` | The minimum length of the input. If omitted, the input has to minimum length. |
| `maxLength` | number | `undefined` | The maximum length of the input. If omitted, the input has no maximum length. |
| `disabled` | boolean | `false` | If true, the input is disabled. |
| `minimal` | boolean | `false` | If true, the input is rendered without a border. |
| `onChange` | function | `undefined` | Attaches the `change` event handler to the input, which is triggered whenever the user changes the value. |

All other props are forwarded to the underlying `<input>`, which is a [styled component][styled-components].

## `<NumberInput>`

This component renders a standard `<input type="number">`, with no special behaviour.

Number inputs forward their ref to the underlying element.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | string | `''` | One or more class names that are forwarded to the input. |
| `value` | string | `'0'` | The value of the input. Note that this is a _string_, not a number, as it is passed directly to the DOM element. |
| `placeholder` | string | `undefined` | The input's placeholder text, shown when the input is empty. |
| `min` | number | `undefined` | The lowest value permitted in the input. If omitted, the input has no minimum value. |
| `max` | number | `undefined` | The highest value permitted in the input. If omitted, the input has no maximum value. |
| `step` | number | `1` | The amount by which the value is increased or decreased when using the up/down buttons or arrow keys. |
| `disabled` | boolean | `false` | If true, the input is disabled. |
| `minimal` | boolean | `false` | If true, the input is rendered without a border. |
| `onChange` | function | no-op | Attaches the `change` event handler to the input, which is triggered whenever the user changes the value. |

All other props are forwarded to the underlying `<input>`, which is a [styled component][styled-components].

[styled-components]: https://www.styled-components.com/
