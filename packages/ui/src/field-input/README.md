# FieldInput

The `<FieldInput>` component implements a generic single- or multi-select input with type-to-search/filter functionality. It has a dropdown list of selectable values (possibly search results) and also lists selected values in-line. The primary use case of this component is for custom fields; the secondary use case is tags.

The `<FieldInput>` component is generic over the value type. As a result, the component requires `getKey`, `getName` and optional `getTag` props to extract information about each value. See [the props documentation](#props).

The `<FieldInput>` component is semi-controlled: the `values` prop is fully controlled, but the selection state and search input are internal to the component.

A `<FieldInput>` contains multiple interactive components; it should not be wrapped in a `<label>`. Instead, use the `aria-label` or `aria-labelledby` prop to associate accessible labels with the field input.

A `<FieldInput>` has no inherent width. You should restrict its width by styling it, setting the `width` or `max-width` CSS property.

Field inputs do _not_ forward refs to any underlying element.

## Examples

A multi-select field input with string values:

```jsx
import {FieldInput} from '@condict/ui';

const allValues = ['Foo', 'Bar', 'Baz', 'Quux'];
const values = ['Bar', 'Quux'];
<FieldInput
  values={values}
  getKey={value => value}
  getName={value => value}
  knownValues={allValues}
  onChange={newValues => ...}
/>
```

A single-select field input with object values:

```jsx
import {FieldInput} from '@condict/ui';

const allValues = [
  {id: 1, name: 'Foo'},
  {id: 2, name: 'Bar'},
  {id: 3, name: 'Baz'},
  {id: 4, name: 'Quux'},
];
const values = [{id: 1, name: 'Foo'}];
<FieldInput
  mode='single'
  values={values}
  getKey={value => value.id}
  getName={value => value.name}
  knownValues={allValues}
  onChange={newValues => ...}
/>
```

A multi-select field input with a custom search function:

```jsx
import {FieldInput} from '@condict/ui';

const handleSearch = query => sendApiSearchRequest(...);
const values = [{id: 123, name: 'Thing'}];
<FieldInput
  values={values}
  getKey={value => value.id}
  getName={value => value.name}
  onSearch={handleSearch}
  onChange={newValues => ...}
/>
```

## Modes

Single vs. multiple selection:

* **Single-select:** If `mode="single"`, then up to one value can be selected. Note that it is *not* an error for the `values` prop to have multiple values, but changing the field input in any way will collapse the selection to one or zero values. In this mode, the input behaves like a list of radio buttons.
* **Multi-select:** If `mode="multi"` (the default), then any number of values can be selected, including zero. In this mode, the input behaves like a list of checkboxes.

Filtering known values vs. searching:

* **Complete list of available values:** If the `knownValues` prop is provided, then the field input knows exactly which values are selectable. The dropdown contains *all* available values, and typing into the text box filters the provided list of values (based on the return value of the `getName()` prop).
* **Searchable values:** If the `onSearch` prop is provided, then the field input does not have a list of all available values. Instead, values are found by typing. The return value of `onSearch` can be an array (for synchronous searching) or a promise that resolves to an array (for async searches). The dropdown contains selected values when there is no search query, or search results when such are available.

If a field input has neither `knownValues` nor `onSearch`, the user will be unable to select any values, as the input does not know how to generate values from the typed text.

## Props

_The type `T` below is the type of the values in the field input._

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `values` | T\[\] | _none; required_ | The currently selected values. Values can be of any type; the field input extracts information about each value via `getKey()`, `getName()` and the optional `getTag()`. |
| `mode` | `'single'` \| `'multi'` | `'multi'` | Sets the input's selection mode. Note that a single-select input _can_ still have multiple entries in `values`, but any attempt to modify the selection will collapse it to one or zero values. |
| `getKey` | function | _none; required_ | A function that extracts a unique identifier from a value. It receives a value (of type `T`) and must return a string or number. The key is used as a React `key` as well as to compare two values for equality (to mark dropdown items as selected, among other things). |
| `getName` | function | _none; required_ | A function that extracts the name from a value. It receives a value (of type `T`) and must return a string. If `onSearch` is omitted, then the value's name is searched by the default type-to-filter implementation. |
| `getTag` | function | `undefined` | If provided, a function that extracts an additional metadata tag that is shown in the dropdown after the value's name (as returned by `getName()`). It receives a value (of type `T`) and must return a string, null or undefined. This metadata is _not_ searched by the default type-to-filter implementation; it is purely informative. An example use could be to display "new value" next to a search result. |
| `className` | string | `''` | One or more class names that are forwarded to the field input's outer wrapper (a `<div>`). |
| `minimal` | boolean | `false` | If true, applies minimal styling to the field input. It removes the outer border. |
| `readOnly` | boolean | `false` | If true, the field input is read-only. It can be focused, and text in the textbox can be selected, but edits are disallowed. |
| `disabled` | boolean | `false` | If true, the field input is disabled. You cannot type into a disabled field input, nor add or delete values. |
| `aria-label` | string | `undefined` | Attaches an accessible label to the field input. This should not be used together with `aria-labelledby`. |
| `aria-labelledby` | string | `undefined` | Contains a space-separated list of IDs of element whose textual content label the field input. This should not be used together with `aria-label`. |
| `aria-describedby` | string | `undefined` | Attaches an accessible description to the field input. |
| `messages` | object | `undefined` | Provides translations for the field input's various messages. See the TypeScript type for details. |
| `knownValues` | T\[\] | `undefined` | If provided, contains an array of all selectable values. The field input will filter this array when typing. If `undefined`, the component should have an `onSearch` that finds values on demand. |
| `onSearch` | function | `undefined` | If provided, contains a function that searches for values when the user types. it receives a search query (with white space trimmed from both ends) and returns an array of `T` or a promise that resolves to an array of `T`. If `undefined`, the component should have a `knownValues` that contains all available values. |
| `onChange` | function | _none; required_ | Handles changes to the field input's values. The function is passed the new list of values. |

