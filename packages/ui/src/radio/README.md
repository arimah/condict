# Radio button

* [Examples](#examples)
* [`<Radio>`](#radio)
* [`Radio.Content`](#radiocontent)
* [`<Radio.Group>`](#radiogroup)

---

Radio buttons are implemented using standard HTML `<input>` elements, chiefly for accessibility reasons. As a result, radios are grouped by `name` prop. The [`<Radio.Group>` component](#radiogroup) can be used to create radio button groups; see that section for details.

## Examples

```jsx
import {Radio} from '@condict/ui';

// Two radios with the same name; that is, in the same group.
<Radio
  name='myOption'
  value='first'
  checked={...}
  onChange={...}
>
  Option 1
</Radio>
<Radio
  name='myOption'
  value='second'
  checked={...}
  onChange={...}
>
  Option 2
</Radio>

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
        name='[foo]'
        value='a'
        checked={...}
        onChange={...}
      >
        Foo
      </Radio>
    </p>
    <p>
      {/* Effective name: items[${index}][bar] */}
      <Radio
        name='[bar]'
        value='x'
        checked={...}
        onChange={...}
      >
        Bar
      </Radio>
    </p>
  </Radio.Group>
)
```

## `<Radio>`

Unlike a standard HTML radio button, the `<Radio>` component renders both the label (as a `<label>`) and the radio button (as an `<input>`). The location of the radio button is controlled by the `marker` prop.

The `<Radio>` component may be used as a controlled or uncontrolled component.

Radio buttons do _not_ forward refs to any underlying element. Use the `inputRef` prop to capture the `<input>`.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | string | `undefined` | One or more class names that are forwarded to the radio button _label_. |
| `checked` | boolean | `undefined` | Determines whether the radio button is checked. |
| `disabled` | boolean | `false` | If true, the radio button is disabled. |
| `marker` | one of `'before'`, `'after'`, `'above'`, `'below'` | `'before'` | Sets the location of the radio button marker (the checkable circle) relative to the label. |
| `name` | string | `''` | The name of the radio button, which is used if the radio button is submitted as part of a form. The radio button name also determines what group it belongs to. |
| `value` | string | `undefined` | The value of the radio button. The value of the group's currently selected radio button is used if the radio button is submitted as part of a form. |
| `inputRef` | ref | `undefined` | Receives the underlying `<input>`. |
| `onChange` | function | no-op | Attaches the `change` event handler to the radio button, which is triggered whenever the user checks the radio button. |
| `children` | node | `undefined` | The content of the radio button label. |

All other props are forwarded to the underlying `<input>`, which is a [styled component][styled-components].

## `Radio.Content`

The [styled component][styled-components] that wraps around the visible content of the radio button. When styling a radio button, this can be used to apply styles to the content wrapper. This is a `<span>`, so can only contain other inline elements. For example:

```jsx
import styled from 'styled-components';
import {Radio} from '@condict/ui';

const MyRadio = styled(Radio)`
  > ${Radio.Content} {
    display: flex:
    flex-direction: column;
    gap: 4px;
  }
`;
```

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
