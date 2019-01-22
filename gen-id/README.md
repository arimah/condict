# @condict/gen-id

Exports the tiniest function for generating a random-enough alphanumeric ID string.

## `genId()`

> `genId(): string`

Returns a 7-character alphanumeric string containing digits 0–9 and letters a–z.

The string returned by this function can be used for element IDs, and anywhere else a random, almost-certainly-unique short string value is required.

### Example

```jsx
import React from 'react';
import genId from '@condict/gen-id';

class MyComponent extends React.Component {
  // It's generally preferable not to change the ID every time
  // the component needs to be re-rendered.
  id = genId();

  render() {
    return (
      <div>
        <input
          aria-describedby={`${this.id}-desc`}
          ...
        />
        ...
        <p id={`${this.id}-desc`}
          Lorem ipsum dolor sit amet.
        </p>
      </div>
    );
  }
}
```
