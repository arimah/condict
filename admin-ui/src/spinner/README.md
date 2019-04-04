# Spinner

A spinner, also known as a _throbber_, is used to show that some content is loading.

It is a non-interactive, non-focusable, purely visual component that is ignored by screen readers. An accessible UI should set `aria-busy` on the component or section that is loading.

By default, the spinner is rendered as a block-level `<span>`. If you need an inline spinner, you must style the component. The colour of the spinner is determined by the CSS `color`, which can be set to style the spinner.

## Examples

```jsx
import styled from 'styled-components';
import {Spinner} from '@condict/admin-ui';

// A default spinner.
<Spinner/>

// A styled spinner with a custom size.
const PurpleSpinner = styled(Spinner)`
  display: inline-block;
  margin: 32px;
  color: rebeccapurple;
`;
<PurpleSpinner size={48}/>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | string | `''` | One or more class names that are forwarded to the outer wrapper (a `<span>`). |
| `size` | number | `24` | The size of the spinner, in pixels. The thickness of the rotating line adjusts automatically. |

Other props are _not_ forwarded to any underlying element.
