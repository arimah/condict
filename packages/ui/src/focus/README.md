# Focus management

This folder exports two components that aid in managing focus, along with a handful of utility functions.

* [Examples](#examples)
* [`<FocusScope>`](#focusscope)
* [`<FocusTrap>`](#focustrap)
* [`getFocusable` and `getTabReachable`](#getfocusable-and-gettabreachable)
* [`sortByTabOrder`](#sortbytaborder)
* [`disableFocusManager` and `enableFocusManager`](#disablefocusmanager-and-enablefocusmanager)
* [Definition of focusable and tab-reachable](#definition-of-focusable-and-tab-reachable)

## Examples

Using `<FocusScope>` to make non-current pages unreachable:

```jsx
import {FocusScope} from '@condict/ui';

const currentIndex = ...;
pages.map((page, index) =>
  <FocusScope key={page.key} active={index === currentIndex}>
    <section>
      {page.contents}
    </section>
  </FocusScope>
)
```

Using `<FocusTrap>` to restrict focus to the contents of a dialog:

```jsx
import {FocusTrap} from '@condict/ui';

const Dialog = props =>
  <FocusTrap active={props.open}>
    <div role='dialog'>
      <h2>{props.title}</h2>
      <p>{props.text}</p>
      {props.buttons}
    </div>
  </FocusTrap>;
```

## `<FocusScope>`

A focus scope is a container of focusable elements that can be made unreachable. It is not possible to tab into an inactive focus scope, nor can its elements be focused by mouse or touch. Click events inside an inactive focus scope are suppressed as well.

Focus scopes do not forward their ref to anything.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `active` | boolean | `true` | If true, the elements inside the focus scope are reachable and interactive. If false, the scope is unreachable. |
| `children` | a JSX element with an element ref | _none; required_ | A single JSX element whose `ref` resolves to an HTML or SVG element. You cannot pass a class element, and functional components must forward their refs. This restriction exists in order to avoid the deprecated [`findDOMNode()`][finddomnode]. |

Other props are _not_ forwarded.

## `<FocusTrap>`

A focus trap forces focus to remain inside its container. When the focus trap is active, it is not possible to tab out of the container, nor can elements outside it be clicked. If multiple focus traps are active in the same document, focus can move freely between them, in DOM order. This feature exists to support portals, and should be used sparingly.

For accessibility reasons, when a focus trap becomes disabled, it will attempt to restore focus to what it was before being activated. This allows the user to continue where they left off after e.g. closing a dialog. The `return` prop controls this behaviour. To disable a focus trap _without_ returning focus (e.g. to open a second dialog), set `active='paused'`. If a paused focus trap becomes disabled, focus does return in accordance with the `return` prop.

If the focus trap is disabled in response to a pointer down event outside of it, it will attempt to set focus to the element that was clicked, so as to avoid jumping away from it in case the default `return` target is a different element.

Focus traps do not forward their ref to anything.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `active` | boolean, `'active'`, `'paused'`, `'disabled'` | `true` | If true or `'active'`, the focus trap will force focus to stay inside it. If false or `'disabled'`, the trap is disabled; elements inside it can still be focused if they are in the document and visible. The value `'paused'` behaves like false/`'disabled'` except that focus does not return to the previous element. |
| `return` | boolean, ref, function | `true` | If this prop is `false`, focus is not returned when the trap is disabled. If `true`, focus is returned to the previously focused element. If set to a ref with an element or a function that returns an element, the focus trap will attempt to return to that element. |
| `onPointerDownOutside` | function | `undefined` | Handles pointer down events (`mousedown`, `touchstart`) outside the current focus trap. If multiple traps are active, this function is called when the pointer is outside _all_ of them, not just this trap (for better portal behavior). The function receives the event target element, and the return value is not used. |
| `children` | a JSX element with an element ref | _none; required_ | A single JSX element whose `ref` resolves to an HTML or SVG element. You cannot pass a class element, and functional components must forward their refs. This restriction exists in order to avoid the deprecated [`findDOMNode()`][finddomnode]. |

Other props are _not_ forwarded.

## `getFocusable` and `getTabReachable`

> `getFocusable(root: Element, options?: TargetOptions): Element[]`  
> `getTabReachable(root: Element, options?: TargetOptions): Element[]`

These functions search `root` for focusable and tab-reachable elements, respectively. The optional argument `options` is an object containing the following properties:

* `includeRoot` (boolean, optional; default: `true`): If true, the `root` element is included as a potential candidate. Otherwise, only the root element's descendants may be returned.
* `sorted` (boolean, optional; default: `true`): If true, the returned elements are sorted by tab order. Otherwise, they are returned in DOM order. Pass `false` if you intend to sort the elements yourself, to avoid the slight overhead.

See the [definitions below](#definition-of-focusable-and-tab-reachable) for more details.

## `sortByTabOrder`

> `sortByTabOrder(elements: Elements[]): Elements[]`

Sorts the specified elements by their tab order, returning a new array with the sorted elements. Although positive tab indexes should not be used, this function does handle them correctly. A tab index of -1 will be treated as 0; ideally such elements should not be passed into this function at all.

## `disableFocusManager` and `enableFocusManager`

> `disableFocusManager(): void`

Temporarily disables the focus manager. Focus traps and focus scopes are effectively paused until the focus manager is re-enabled. This function exists only to support those cases where another focus manager needs to take over; for example, to render a menu system where it is imperactive that focus stays inside the menu.

If this function is called multiple times, the focus manager will be re-enabled after calling `enableFocusManager()` the same number of times.

> `enableFocusManager(): void`

Re-enables the focus manager. If `disableFocusManager()` was called multiple times, this function must be called the same number of times to re-enable the focus manager.

## Definition of focusable and tab-reachable

Unfortunately a large number of inconsistencies exist between browsers and OSes in the realm of focus and tab-reachability. These components represent a best effort attempt at finding a reasonable middle ground.

The following elements are considered _focusable_ unless hidden (by `visibility: hidden` or `display: none`):

* `<button>`;
* `<input>` of type other than `hidden`;
* `<textarea>`;
* `<select>`;
* `<a>` with an `href` attribute;
* `<audio>` and `<video>` with a `controls` attribute;
* Any element with a `tabindex` attribute:
* Any element with a `contenteditable` attribute that is not `false` (the root of a contenteditable).

In practice, these rules catch all common focusable elements. To mark an element _not_ covered by the above as focusable, it is sufficient to place a `tabindex='0'` attribute on it.

In addition, an element is _tab-reachable_ if it is focusable and at least one of the following holds:

* It does not have a negative tab index (the default is 0 for form elements).
* It is radio button that is (1) checked, or (2) unchecked and every other radio button in the group is also unchecked.

Although positive tab indexes should not be used, these components do handle them correctly.

[finddomnode]: https://reactjs.org/docs/react-dom.html#finddomnode
