# Accessibility utilities

This module exports reusable functions and React components for various accessibility-related tasks.

* [`Announcer`](#announcer)
* [`Announcements`](#announcements)
* [`useAnnouncements()`](#useannouncements)
* [`SROnly`](#sronly)

## `<Announcer>`

Implements an announcer for screen reader-only messages. The `<Announcer>` component is used when other components need to announce state changes that cannot easily be communicated through visible text or ARIA attributes. The messages that an announcer manages are inherently ephemeral and temporary. They cannot be repeated and disappear from the DOM after a short time.

An [`Announcements` controller](#announcements) cannot have more than one `<Announcer>` associated with it.

The `<Announcer>` component renders an [`<SROnly>`](#sronly), and is not customisable in any way.

The `<Announcer>` component does _not_ forward its ref to anything.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `controller` | Announcements | _none; required_ | The controller that receives announcements, which the announcer component will listen to messages from. This value is created by [`useAnnouncements()`](#useannouncements). |
| `silent` | boolean | `false` | If true, suppresses all announcements. For example, if the component that uses announcements loses focus, it should generally cease making noise. |

Other props are _not_ forwarded to any underlying element.

### Example

```jsx
import {Announcer, useAnnouncements} from '@condict/ui';

const MyThing = (...) => {
  const [focused, ...] = useState(...);

  const messages = useAnnouncements();

  return (
    <Wrapper>
      ...
      <Button
        label='Add the thing'
        onClick={() => {
          addTheThing();
          messages.announce('Added the thing');
        }}
      />
      <Announcer controller={messages} silent={!focused}/>
    </Wrapper>
  );
};
```

## Announcements

The `Announcements` type is an opaque type that is used for sending announcements. It is created by the [`useAnnouncements()`](#useannouncements) hook. Values of this type only manage messages to be announced; it does not in itself cause the screen reader to say anything. It must be attached to an [`<Announcer>`](#announcer).

An `Announcements` controller cannot have more than one [`<Announcer>`](#announcer) associated with it.

The announcements controller exposes one method:

> `announce(message: string): void`

Sends a message to be announced. If there is no attached [`<Announcer>`](#announcer), or the announcer has been silenced, then the message is ignored and not output in any way.

## `useAnnouncements()`

> `useAnnouncements(): Announcements`

Implements a hook that returns an [`Announcements` controller](#announcements), through which messages can be sent. The value is stable across renders.

See example under [`<Announcer>`](#announcer).

## `<SROnly>`

A [styled component][styled-components] that renders a hidden element (by default a `<span>`) whose text contents can be picked up by screen readers, to provide additional accessible text where required.

**This component should be used sparingly.** It's often better to expose visible status text for _everyone_ to consume.

The DOM node rendered by this component can be given an `id` and targetted by the `aria-labelledby` or `aria-describedby` attributes.

Since this component exists for accessibility reasons, you should obviously ensure it only contains text children. Non-text content *will not* be read. Do not put interactive content inside it. Do not make it focusable.

### Props

None declared. Accepts anything that can be given to a [styled component][styled-components].

Normally you should not give this any props other than `id`. Children should be restricted to text content.

### Example

```jsx
import {SROnly} from '@condict/ui';

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
