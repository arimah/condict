# TagInput

The `<TagInput>` component defines an editable tag list. Tags can contain any arbitrary text content except `,` and `;`, as those characters are used to separate tags when typing.

The `<TagInput>` component is partially controlled: the `tags` prop determines which tags are in the input, but the textbox contents and the selection state are controlled by the tag input.

A `<TagInput>` contains multiple interactive components; it should not be wrapped in a `<label>`. Instead, use the `aria-label` or `aria-labelledby` prop to associate accessible labels with the tag input.

Tag inputs do _not_ forward refs to any underlying element.

## Examples

```jsx
import {TagInput} from '@condict/admin-ui';

// A simple tag input.
<TagInput
  tags={...}
  onChange={...}
/>

// A tag input with minimal styling and an accessible label.
<TagInput
  minimal
  tags={...}
  onChange={...}
  aria-labelledby='my-taginput-label'
/>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | string | `''` | One or more class names that are forwarded to the tag input's outer wrapper (a `<span>`). |
| `tags` | Array&lt;string&gt; | `[]` | The currently selected tags. Tags should be [normalized](#tag-normalization) and unique. If any tag contains `,` or `;`, editing behaviour is undefined (and almost certainly weird for the user). |
| `minimal` | boolean | `false` | If true, applies minimal styling to the tag input. Basically, it removes the outer border. |
| `disabled` | boolean | `false` | If true, the tag input is disabled. You cannot type into a disabled tag input, nor delete existing tags. |
| `onChange` | function | no-op | Handles changes to the tag input's tags. The function is passed the new list of tags, as an array of strings. |
| `aria-label` | string | `undefined` | Attaches an accessible label to the tag input. This should not be used together with `aria-labelledby`. |
| `aria-labelledby` | string | `undefined` | Contains a space-separated list of IDs of element whose textual content label the tag input. This should not be used together with `aria-label`. |

Other props are _not_ forwarded to any underlying element.

## Tag normalization

Any tag that is edited through the tag input undergoes normalization. The following steps are applied:

* All consecutive white space is collapsed into a single space (`' '`, U+0020).
* Leading and trailing white space is removed.

Example: <code>foo&nbsp;&nbsp;&nbsp;bar&nbsp;</code> becomes the tag `foo bar`.

Additionally, the tag input ensures no tag contains the characters `,` or `;`, as they are used to separate tags. If text is pasted into the tag input containing either these characters, multiple tags are added.
