# Switch

A `<Switch>` is a component that encapsulates an on/off state. It is similar to a [checkbox](../checkbox), but note the following differences:

* A checkbox represents selected/unselected, while a switch represents on/off.
* A switch is an independent option (e.g. it doesn't belong in a group of related options).
* Toggling a switch has an immediate effect (e.g. there is no "save" or "submit" step). The user can reverse the effect by toggling the switch again.
* A switch has no indeterminate/half-checked state: it is always on or off.

More reading: [Checkbox vs Toggle Switch][uxplanet], UX Planet; [Toggle-Switch Guidelines][nngroup], Nielsen Norman Group.

The `<Switch>` component is implemented as an `<input type="checkbox">`, with additional ARIA attributes for accessibility reasons. Like the [checkbox component](..checkbox), the switch component renders both the label (as a `<label>`) and the switch (as an `<input>`). It is currently not possible to configure the placement of the switch; it always comes before the label.

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
| `intent` | one of `'primary'`, `'secondary'`, `'danger'` | `'primary'` | Determines what intent styling to give the switch. Unchecked switches look identical regardless of intent. |
| `label` | string | `''` | A string value that contains the switch's text. If used together with children, this value defines the switch's accessible label. |
| `labelProps` | object | `null` | An object of additional properties to pass on to the `<label>`. |
| `inputRef` | ref | `undefined` | Receives the underlying `<input>`. |
| `onChange` | function | no-op | Attaches the `change` event handler to the switch, which is triggered whenever the user changes the switch state. |
| `children` | node | `null` | The content of the switch label. If used together with `label`, this becomes the visible content of the switch. |

All other props are forwarded to the underlying `<input>`, which is a [styled component][styled-components].

In general, the `danger` intent should be avoided, since the effect of toggling a switch is immediate.

Note that the `<Switch>` component does _not_ have an explicit `name` prop. Since switches represent immediate toggles, it makes no sense to submit them as part of a form.

[uxplanet]: https://uxplanet.org/checkbox-vs-toggle-switch-7fc6e83f10b8
[nngroup]: https://www.nngroup.com/articles/toggle-switch-guidelines/
[styled-components]: https://www.styled-components.com/
