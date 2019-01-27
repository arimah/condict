# Radio button

* [Examples](#examples)
* [`<Radio>`](#radio)
* [`<Radio.Group>`](#radiogroup)

---

Radio buttons are implemented using standard HTML `<input>` elements, chiefly for accessibility reasons. As a result, radios are grouped by `name` prop. The [`<Radio.Group>` component](#radiogroup) can be used to create radio button groups; see that section for details.

## Examples

```jsx
import {Radio} from '@condict/admin-ui';

// Two radios with the same name; that is, in the same group.
<Radio
  label='Option 1'
  name='myOption'
  value='first'
  checked={...}
  onChange={...}
/>
<Radio
  label='Option 2'
  name='myOption'
  value='second'
  checked={...}
  onChange={...}
/>

// An explicit radio group (with a random name prefix).
// These radio buttons are independent of the above, despite having
// the same name.
<Radio.Group>
  <Radio
    name='myOption'
    value='0'
    checked={...}
    onChange={...}
  >
    First option
  </Radio>
  <Radio
    name='myOption'
    value='0'
    checked={...}
    onChange={...}
  >
    Second option
  </Radio>
</Radio.Group>

// Multiple independent radio groups with explicit names. The effective
// name (used when submitting the radios as part of a form) of each radio
// button is the group name followed by the radio's own name.
groups.map((options, index) =>
  <Radio.Group key={index} name={`items[${index}]`}>
    <p>
      {/* Effective name: items[${index}][foo] */}
      <Radio
        label='Foo'
        name='[foo]'
        value='a'
        checked={...}
        onChange={...}
      />
    </p>
    <p>
      {/* Effective name: items[${index}][bar] */}
      <Radio
        label='Bar'
        name='[bar]'
        value='x'
        checked={...}
        onChange={...}
      />
    </p>
  </Radio.Group>
)
```

## `<Radio>`

Unlike a standard HTML radio button, the `<Radio>` component renders both the label (as a `<label>`) and the radio button (as an `<input>`). It is currently not possible to configure the placement of the radio button; it always comes before the label.

The `<Radio>` component is fully controlled. You must supply an `onChange` handler to make it interactive.

Radio buttons do _not_ forward refs to any underlying element. Use the `inputRef` prop to capture the `<input>`.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | string | `''` | One or more class names that are forwarded to the radio button _label_. |
| `checked` | boolean | `false` | Determines whether the radio button is checked. |
| `disabled` | boolean | `false` | If true, the radio button is disabled. |
| `intent` | one of `'primary'`, `'secondary'`, `'danger'` | `'primary'` | Determines what intent styling to give the radio button. Unchecked radio buttons look identical regardless of intent. |
| `label` | string | `''` | A string value that contains the radio button's text. If used together with children, this value defines the radio button's accessible label. |
| `name` | string | `''` | The name of the radio button, which is used if the radio button is submitted as part of a form. The radio button name also determines what group it belongs to. |
| `value` | string | `undefined` | The value of the radio button. The value of the group's currently selected radio button is used if the radio button is submitted as part of a form. |
| `labelProps` | object | `null` | An object of additional properties to pass on to the `<label>`. |
| `inputRef` | ref | `undefined` | Receives the underlying `<input>`. |
| `onChange` | function | no-op | Attaches the `change` event handler to the radio button, which is triggered whenever the user checks the radio button. |
| `children` | node | `null` | The content of the radio button label. If used together with `label`, this becomes the visible content of the radio button. |

All other props are forwarded to the underlying `<input>`, which is a [styled component][styled-components].

## `<Radio.Group>`

The radio group component assigns a prefix to each radio button inside the group. By doing this, the `<Radio.Group>` component effectively allows radio buttons to be grouped. The default name prefix is a random string. If you need a specific name, you can set the name prefix yourself.

Radio buttons receive the name prefix of the nearest enclosing radio group.

This component does not render a DOM node of its own.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | string | `null` | A string value that is prefixed to the name of every radio button in the group. If omitted, a random prefix is generated. The same random prefix is used for all radio buttons. |
| `children` | node | `undefined` | The content of the radio group. Any React renderable is permitted. |

[styled-components]: https://www.styled-components.com/
