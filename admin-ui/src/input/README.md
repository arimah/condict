# Input

* [Examples](#examples)
* [`<NumberInput>`](#numberinput)
* [`<TextInput>`](#textinput)

## Examples

```jsx
import {NumberInput, TextInput} from '@condict/admin-ui';

// A basic number input.
<NumberInput
  value={...}
  placeholder='Enter a percentage'
  min={0}
  max={100}
  step={0.1}
  onChange={...}
/>

// A minimal URL input with auto-size behaviour.
<TextInput
  value={...}
  type='url'
  placeholder='Image address'
  minimal
  autoSize
  onChange={...}
/>

// A round search input with a keydown handler.
<TextInput
  value={...}
  type='search'
  placeholder='Search products, categories, ...'
  borderRadius='50%'
  onChange={...}
  onKeyDown={...}
/>
```

## `<NumberInput>`

This component renders a standard `<input type="number">`, with no special behaviour.

The `<NumberInput>` component is fully controlled. You must supply an `onChange` handler to make it interactive.

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
| `borderRadius` | string | `undefined` | If specified, sets the border radius of the input. Note that this is a CSS string, not a number. If omitted, uses the default styling. |
| `onChange` | function | no-op | Attaches the `change` event handler to the input, which is triggered whenever the user changes the value. |

All other props are forwarded to the underlying `<input>`, which is a [styled component][styled-components].

## `<TextInput>`

This component renders a standard `<input>` of a text type (by default, `text`). A `<TextInput>` can be told to auto-size itself, but beyond that, it has no special behaviour.

The `<TextInput>` component is fully controlled. You must supply an `onChange` handler to make it interactive.

Text inputs do _not_ forward their ref to the underlying element. Use the `inputRef` prop to capture the `<input>`.

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
| `autoSize` | boolean | `false` | If true, the input's width is adjusted to match the text. This is accomplished by setting the `width` CSS property directly on the input's `style`. To give it a minimum or maximum width, use the CSS `min-width` and `max-width` properties. Auto-size does not work well with password inputs. |
| `borderRadius` | string | `undefined` | If specified, sets the border radius of the input. Note that this is a CSS string, not a number. If omitted, uses the default styling. |
| `inputRef` | ref | `undefined` | Receives the underlying `<input>`. |
| `onChange` | function | no-op | Attaches the `change` event handler to the input, which is triggered whenever the user changes the value. |

All other props are forwarded to the underlying `<input>`, which is a [styled component][styled-components].

[styled-components]: https://www.styled-components.com/
