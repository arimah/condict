# NonIdealState

A non-ideal state indicates a state that requires further action in order for some part of the system to become useful. For example, when a collection is empty. This component is _not_ used to signal an error state. If the user can amend the non-ideal state, a related action should be shown; for example, if the dictionary is empty, the non-ideal state should ideally (pun intended) include a button to create a word.

A non-ideal state consists of up to four components, in order:

* A friendly image (optional).
* A title, which summarises the non-ideal state very briefly, such as "There are no users".
* A description (optional), which is a single paragraph that describes the state or, even better, what the user can do to amend it.
* An action (optional), ideally a single button that lets the user add the missing data.

The `<NonIdealState>` component has a fixed width. To change its width, it is necessary to style the component. Additionally, the component centers itself within its parent container, by setting its left and right margins to `auto`.

## Examples

```jsx
import {NonIdealState, Button} from '@condict/admin-ui';

// A non-ideal state for an empty dictionary.
<NonIdealState
  image={<ConlangFlag/>}
  title='There are no languages'
  description="Let's get started - the first step is to add a language."
  action={
    <Button
      label='Add a language'
      onClick={...}
    />
  }
/>

// A non-ideal state with only a title and description.
<NonIdealState
  title='No search results found'
  description={
    `No matches for "${query}". Check for spelling errors, or try a less specific query.`
  }
/>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | string | `''` | One or more class names that are forwarded to the outer wrapper (a `<div>`). |
| `minimal` | boolean | `false` | If true, applies minimal styling to the element. Basically, it removes the border and drop shadow. |
| `image` | node | `undefined` | An image to show above the title. This can be any React renderable, but obviously something that results in an image is preferred. The image is horizontally centered. |
| `title` | node | none; required | The title to give the non-ideal state. The title is rendered inside a heading tag, whose level is determined by the `headingLevel` prop. The text is horizontally centered. |
| `headingLevel` | one of `2`, `3`, `4`, `5`, `6` | `2` | The level of the heading that contains the title. This prop does not affect the visual appearance of the title; its only purpose is to ensure the document has a meaningful hierarchy. The default level is 2, meaning the title is rendered as an `<h2>`. Level 1 headings should not be used for this component. |
| `description` | node | `undefined` | A (slightly) more detailed description of the non-ideal state, which is rendered inside a `<p>`. The description is horizontally centered if it's narrower than the outer wrapper; otherwise, the text is left-aligned. |
| `action` | node | `undefined` | An action, typically in the form of a single button, that lets the user amend the non-ideal state. The action is horizontally centered. |

Additional props are _not_ forwarded to any underlying element. A non-ideal state is not in itself interactive, so cannot be disabled.
