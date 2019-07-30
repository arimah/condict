# Pages

The `<Pages>` component implements a generic page list, for pagination. This component does not manage the fetching of data; it only shows a list of selectable pages.

Page lists forward their ref to the outer wrapper (a `<div>`).

## Examples

```jsx
import {Pages} from '@condict/ui';

// A basic page list.
<Pages
  page={...}
  totalPages={...}
  onChange={page => { ... }}
/>

// A loading page list with custom context and label.
<Pages
  label='Derived definitions pagination'
  loading
  page={...}
  totalPages={...}
  context={4}
  onChange={...}
/>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | string | `''` | One or more class names that are forwarded to the outer wrapper (a `<div>`). |
| `page` | number | `0` | The current page number. Pages are zero-based in code, but displayed in UIs as one-based. |
| `totalPages` | number | `1` | The total number of pages. This value should be greater than zero; if there are no pages at all, don't render a `<Pages>`. |
| `context` | number | `2` | The number of pages to show before and after the current page. |
| `label` | string | `undefined` | An ARIA label that describes what the pages relate to. This should be used if there are multiple page lists. |
| `loading` | boolean | `false` | If true, shows a loading indicator on the current page number, which can be used to indicate that content is being loaded for that page. |
| `disabled` | boolean | `false` | If true, the page list is disabled; the user cannot change the page. |
| `onChange` | function | no-op | A function that receives the new page when the user clicks on a page button. |

Other props are _not_ forwarded to any underlying element.
