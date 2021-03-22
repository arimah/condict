# Layout primitives

This module contains various components to help with building layouts.

## `<Grid>`

A [styled component][styled-components] that offers offers a concise way to define a [CSS grid][css-grid]. It renders a `<div>` by default.

**Note:** To avoid generating a large number of dynamic class names, this component sets most CSS grid properties via the `style` attribute. If you use the `as` prop to change the underlying component type, it _must_ accept _both_ `className` and `style`. This also means those CSS properties cannot be overridden by styling the component; however, any props that are omitted will also be absent in the `style` object.

**Also note:** This component _cannot_ be used to define a viewport-aware grid. For that, you must manually style an element to add appropriate media queries.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `inline` | boolean | `false` | If true, the grid gets `display: inline-grid` instead of the default `display: grid`. This CSS property is _not_ set via `style`. |
| `rows` | string | `undefined` | Defines the grid's [template rows](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows). The value is one or more CSS track-size values, such as `'1fr auto minmax(10px, 2fr)'`. |
| `columns` | string | `undefinde` | Defines the grid's [template columns](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns). The value is one or more CSS track-size values, such as `'1fr 8ch auto'`. |
| `gap` | string | `undefined` | If set, defines the [grid cell gap](https://developer.mozilla.org/en-US/docs/Web/CSS/gap). Note that this property only applies to the gap _between_ cells, and does not affect the distance between the grid's outer edges and the cells (for that, set the grid's padding). The value is one or two CSS length values, separated by spaces. |
| `autoRows` | string | `undefined` | Defines the grid's [auto rows](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-rows). The value is one or more CSS track-size values. |
| `autoColumns` | string | `undefined` | Defines the grid's [auto columns](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-columns). The value is one or more CSS track-size values. |
| `autoFlow` | string | `undefined` | Defines the grid's [auto flow](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow) behaviour. The value is a CSS `grid-auto-flow` value, such as `'row'`, `'column'`, `'row dense'` or `'column dense'`. |
| `alignCellsX` | [CellAlignment](#cellalignment) | `undefined` | Defines the [default horizontal alignment of cells](https://developer.mozilla.org/en-US/docs/Web/CSS/justify-items). |
| `alignCellsY` | [CellAlignment](#cellalignment) | `undefined` | Defines the [default vertical alignment of cells](https://developer.mozilla.org/en-US/docs/Web/CSS/align-items). |
| `row` | number \| string | `undefined` | Sets the [preferred row][grid-row] of the grid, allowing it to be used as a cell within another grid. The value is a column number or a CSS `grid-row` value, such as `4`, `'3 / 5'` or `'span 2'`. |
| `column` | number \| string | `undefined` | Sets the [preferred column][grid-column] of the grid, allowing it to be used as a cell within another grid. The value is a CSS `grid-column` value, such as `2`, `'1 / 6'` or `'2 / span 4'`. |
| `alignSelfX` | [CellAlignment](#cellalignment) | `undefined` | Sets the [grid's horizontal alignment][justify-self], allowing it to be used as a cell within another grid. |
| `alignSelfY` | [CellAlignment](#cellalignment) | `undefined` | Sets the [grid's vertical alignment][align-self], allowing it to be used as a cell within another grid. |

Other props are forwarded to the underlying element.

### Example

```jsx
import {Grid, Cell, Checkbox, Button} from '@condict/ui';

// A grid with a fixed column layout and automatic rows.
<Grid
  columns='1fr auto 2fr'
  autoRows='1fr auto'
>
  ...
</Grid>

// A grid with a fixed layout that contains various components, including <Cell>s.
<Grid
  columns='repeat(3, 1fr)'
  rows='1fr 100px'
  alignCellsX='start'
  alignCellsY='center'
>
  {/* row 1, column 1 */}
  <Checkbox label='An option'/>
  {/* row 1, column 2 */}
  <p>Some text.</p>
  {/* row 1, column 3 */}
  <Button label='An action'/>
  {/* row 2, column 1 */}
  <Button label='Another action here'/>
  {/* row 2, column 2 through 3 */}
  <Cell column='span 2' alignX='center'>
    This content is inside a Cell component.
  </Cell>
</Grid>
```

## `<Cell>`

A [styled component][styled-components] that renders an element (by default a `<div>`) with various CSS properties that pertain to grid cells. This component exists mainly for convenience: a [`<Grid>`](#grid) can contain any element.

**Note:** To avoid generating a large number of dynamic class names, this component sets most CSS grid properties via the `style` attribute. If you use the `as` prop to change the underlying component type, it _must_ accept _both_ `className` and `style`. This also means those CSS properties cannot be overridden by styling the component; however, any props that are omitted will also be absent in the `style` object.

See example under [`<Grid>`](#grid).

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `row` | number \| string | `undefined` | Sets the [preferred row][grid-row] of the cell within the grid. The value is a column number or a CSS `grid-row` value, such as `4`, `'3 / 5'` or `'span 2'`. |
| `column` | number \| string | `undefined` | Sets the [preferred column][grid-column] of the cell within the grid. The value is a CSS `grid-column` value, such as `2`, `'1 / 6'` or `'2 / span 4'`. |
| `alignX` | [CellAlignment](#cellalignment) | `undefined` | Sets the [cell's horizontal alignment][jusify-self] within the grid. |
| `alignY` | [CellAlignment](#cellalignment) | `undefined` | Sets the [grid's vertical alignment][align-self] within the grid. |

Other props are forwarded to the underlying element.

## `CellAlignment`

> `type CellAlignment = ...;`

Represents a cell's vertical or horizontal alignment. The possible values represent a subset of the possible values of the [`justify-self`][justify-self] and [`align-self`][align-self] properties (see links for more documentation on the meanings of these values):

* `'auto'`
* `'stretch'`
* `'center'`
* `'start'`
* `'end'`
* `'baseline'`
* `'first baseline'`
* `'last baseline'`

## `<Panel>`

A [styled component][styled-components] that implements a generic container (by default a `<div>`). It has a border-to-content padding of 16px, and removes the top margin of its first child and bottom padding of its last. In addition, the panel applies correct styles if focused (when `tabIndex` is set).

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `minimal` | boolean | `false` | If true, the panel is drawn without a border. |
| `raised` | boolean | `false` | If true, the panel is drawn with a shadow that offsets it from the surface. |

Other props are forwarded to the underlying element.

### Example

```jsx
import {Panel, Button} from '@condict/ui';

// A generic panel with no special styling.
<Panel>
  <p>Lorem ipsum dolor sit amet.</p>
</Panel>

// A minimal that acts like a group and has an accessible label.
<Panel minimal role='group' aria-labelledby='panel-text'>
  <h2 id='panel-text'>A panel title</h2>
  <p>Some important content that relates to the app in some way.</p>
  <Button label='A useful button' command='doTheThing'/>
</Panel>
```

[css-grid]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout
[grid-column]: https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column
[grid-row]: https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row
[justify-self]: https://developer.mozilla.org/en-US/docs/Web/CSS/justify-self
[align-self]: https://developer.mozilla.org/en-US/docs/Web/CSS/align-self
[styled-components]: https://www.styled-components.com/
