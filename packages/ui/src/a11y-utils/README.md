# Accessibility utilities

This module exports reusable functions and React components for various accessibility-related tasks.

* [`getContentAndLabel()`](#getcontentandlabel)
* [`SROnly`](#sronly)

## `getContentAndLabel`

> `getContentAndLabel(children: any, label: ?string): [any, ?string]`

Given a React element (`children`) and a string `label`, returns an array of two elements:

- The visible content of the control.
- The ARIA label to be passed to `aria-label`, or undefined if there is no label.

Using this function allows components to render their `label` property as content, unless children are present, in which case they get precedence. (WAI-ARIA guidelines: prefer visible labels.)

### Example

```jsx
import {getContentAndLabel} from '@condict/a11y-utils';

const MyButton = ({children, label, ...rest}) => {
  const [content, ariaLabel] = getContentAndLabel(children, label);
  return (
    <button {...rest} aria-label={ariaLabel}>
      {content}
    </button>
  );
};

// Only `label`, which is rendered inside the button:
<MyButton label='Next item'/>;

// Only children, which are also rendered inside the button (the text node
// is read by assistive technologies):
<MyButton>Next item <ArrowRightIcon/></MyButton>

// `label` and children mixed; children are shown, and the label becomes
// the accessible text:
<MyButton label='Next item'><ArrowRightIcon/></MyButton>
```

## SROnly

A [styled component][styled-components] that renders a hidden element (by default a `<span>`) whose text contents can be picked up by screen readers, to provide additional accessible text where required.

**This component should be used sparingly.** It's often better to expose visible status text for _everyone_ to consume.

The DOM node rendered by this component can be given an `id` and targetted by the `aria-labelledby` or `aria-describedby` attributes.

Since this component exists for accessibility reasons, you should obviously ensure it only contains text children. Non-text content *will not* be read. Do not put interactive content inside it. Do not make it focusable.

### Props

None declared. Accepts anything that can be given to a [styled component][styled-components].

Normally you should not give this any props other than `id`. Children should be restricted to text content.

### Example

```jsx
import {SROnly} from '@condict/a11y-utils';

const SearchField = props => (
  <Wrapper>
    <SearchInput
      aria-describedby='search-field-desc'
      ...
    />
    <SROnly id='search-field-desc'>
      Use up and down arrow keys to navigate results when available.
    </SROnly>
  </Wrapper>
);
```

[styled-components]: https://www.styled-components.com/
