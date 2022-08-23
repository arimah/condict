# Switch

A `<Switch>` is a component that encapsulates an on/off state. It is similar to a [checkbox](../checkbox), but note the following differences:

* A checkbox represents selected/unselected, while a switch represents on/off.
* A switch is an independent option (i.e. it doesn't belong in a group of related options).
* Toggling a switch has an immediate effect (i.e. there is no "save" or "submit" step). The user can reverse the effect by toggling the switch again.
* A switch has no indeterminate/half-checked state: it is always on or off.

More reading: [Checkbox vs Toggle Switch][uxplanet], UX Planet; [Toggle-Switch Guidelines][nngroup], Nielsen Norman Group.

The `<Switch>` component is implemented as an `<input type="checkbox">`, with additional ARIA attributes for accessibility reasons. Like the [checkbox component](../checkbox), the switch component renders both the label (as a `<label>`) and the switch (as an `<input>`). The location of the switch is controlled by the `marker` prop.

The `<Switch>` component is fully controlled. You must supply an `onChange` handler to make it interactive.

Switches do _not_ forward refs to any underlying element. Use the `inputRef` prop to capture the `<input>`.

## Examples

```jsx
import {Switch} from '@condict/ui';

// A simple switch with a label.
<Switch label='Dark mode' checked={...} onChange={...}/>

// A switch with rendered content.
<Switch checked={...} onChange={...}
  <WirelessIcon/> WiFi
</Switch>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | string | `''` | One or more class names that are forwarded to the switch _label_. |
| `checked` | boolean | `false` | Determines whether the switch is checked. |
| `disabled` | boolean | `false` | If true, the switch is disabled. |
| `marker` | one of `'before'`, `'after'`, `'above'`, `'below'` | `'before'` | Sets the location of the switch marker (the sliding switch itself) relative to the label. |
| `label` | string | `''` | A string value that contains the switch's text. If used together with children, this value defines the switch's accessible label. |
| `labelProps` | object | `null` | An object of additional properties to pass on to the `<label>`. |
| `inputRef` | ref | `undefined` | Receives the underlying `<input>`. |
| `onChange` | function | no-op | Attaches the `change` event handler to the switch, which is triggered whenever the user changes the switch state. |
| `children` | node | `null` | The content of the switch label. If used together with `label`, this becomes the visible content of the switch. |

All other props are forwarded to the underlying `<input>`, which is a [styled component][styled-components].

Note that the `<Switch>` component does _not_ have an explicit `name` prop. Since switches represent immediate toggles, it makes no sense to submit them as part of a form.

## `Switch.Content`

The [styled component][styled-components] that wraps around the visible content of the switch. When styling a switch, this can be used to apply styles to the content wrapper. This is a `<span>`, so can only contain other inline elements. For example:

```jsx
import styled from 'styled-components';
import {Switch} from '@condict/ui';

const MySwitch = styled(Switch)`
  > ${Switch.Content} {
    display: flex:
    flex-direction: column;
    gap: 4px;
  }
`;
```

[uxplanet]: https://uxplanet.org/checkbox-vs-toggle-switch-7fc6e83f10b8
[nngroup]: https://www.nngroup.com/articles/toggle-switch-guidelines/
[styled-components]: https://www.styled-components.com/
