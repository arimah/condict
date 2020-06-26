# @condict/table-editor

* [`<InflectionTableEditor>`](#inflectiontableeditor)
* [`<InflectionTableEditor.Commands>`](#inflectiontableeditorcommands)
* [`InflectionTable`](#inflectiontable)
* [`InflectionTableMessages`](#inflectiontablemessages)
* [`<DefinitionTableEditor>`](#definitiontableeditor)
* [`<DefinitionTableEditor.Commands>`](#definitiontableeditorcommands)
* [`DefinitionTable`](#definitiontable)
* [`DefinitionTableMessages`](#definitiontablemessages)

---

Condict permits word inflection rules to be defined, in the shape of inflection tables. This package implements Condict's table editors. Note that there are two table editors: one for defning inflection tables ([`<InflectionTableEditor>`](#inflectiontableeditor)), and another for customizing those tables for a single definition ([`<DefinitionTableEditor>`](#definitiontableeditor)).

## `<InflectionTableEditor>`

The `<InflectionTableEditor>` component edits inflection tables. An inflection table contains any number of header cells as well as data cells with inflection patterns. The exact details of inflected forms are beyond the scope of this readme.

### Examples

```jsx
import {Menu} from '@condict/ui';
import {InflectionTableEditor, InflectionTable} from '@condict/table-editor';

const table = InflectionTable.fromJson(myTableData);

// A simple editor.
<InflectionTableEditor value={table} onChange={newTable => ...}/>

// An editor with a customized context menu.
<InflectionTableEditor
  value={table}
  onChange={newTable => ...}
  contextMenuExtra={
    <>
      <Menu.Item label='Undo' command='undo'/>
      <Menu.Item label='Redo' command='redo'/>
    </>
  }
/>

// Get the table data back:
const tableData = InflectionTable.export(table);
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | [InflectionTable](#inflectiontable) | _none; required_ | The table to be edited. |
| `className` | string | `undefined` | One or more class names that are forwarded to the underlying element. |
| `disabled` | boolean | `false` | If true, the table editor is disabled. A disabled table editor cannot be focused, its cells cannot be edited, and never shows its context menu. |
| `contextMenuExtra` | node | `undefined` | Additional menu items that are added to the end of the table's context menu. Can be used to inject e.g. Undo/Redo functionality. |
| `messages` | [InflectionTableMessages](#inflectiontablemessages) | `undefined` | The table's UI messages. See the [`InflectionTableMessages`](#inflectiontablemessages) type for more details. |
| `onChange` | function | _none; required_ | Receives changes to the table. If a cell's text is edited, this function is called when the cell is committed (when the cell editor is closed), _not_ on each keystroke. |

Other props are ignored and _not_ forwarded to any underlying component. This component does not forward its ref to anything.

## `<InflectionTableEditor.Commands>`

This component exposes various [commands][ui/commands] for manipulating inflection tables. The component can be put around toolbars, buttons, menus, and anything else that supports Condict UI commands. The following commands are available:

* `deleteSelectedRows`, `deleteSelectedColumns`: Deletes selected rows and columns, respectively.
* `insertRowAbove`, `insertRowAtTop`, `insertRowBelow`, `insertRowAtBottom`: Inserts rows in the specified locations. "Above" and "below" are relative to the current selection.
* `insertColumnBefore`, `insertColumnAtStart`, `insertColumnAfter`, `insertColumnAtEnd`: Inserts columns in the specified locations. "Before" and "after" are relative to the current selection.
* `toggleHeader`: Converts all selected cells to header cells or data cells, whichever is the opposite of the focused cell.
* `mergeSelection`: Merges all selected cells into a single cell, which spans multiple rows and columns. The contents of the first non-empty cell are kept; all others cells are deleted. If only one cell is selected, this is a no-op.
* `separateSelection`: Separates the selected cells into cells with a row and column span of 1. If no merged cells are selected, this is a no-op.
* `clearSelectedCells`: Removes the text content from each selected cell. Other cell data, such as custom display names, is kept.
* `toggleDeriveLemma`: Sets the "derive lemma" setting of all selected cells to the opposite of the focused cell, or the first data cell if the focus is on a header cell.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | string or component type | `'div'` | An HTML element name or a React component type that decides what the command group is rendered as. |
| `value` | [InflectionTable](#inflectiontable) | _none; required_ | The inflection table that the commands operate on.
| `disabled` | boolean | `false` | If true, disables all table commands. |
| `onChange` | function | _none; required_ | Receives changes to the table, as a result of executing one of the commands. |

All props except `value` and `onChange` are forwarded to the inner [`<CommandGroup>`][ui/commands/group]. See that documentation for more details.

## `InflectionTable`

> `type InflectionTable`
> `const InflectionTable`

This is the shape of an inflection table, containing its rows and cells, as well as the currently selected cells. The exported constant contains two methods for interacting with inflection tables:

> `InflectionTable.fromJson(rows: InflectionTableJson): InflectionTable`

Converts GraphQL-compliant table rows into an `InflectionTable` to be passed into an editor. Any cell that does not have an `inflectedForm` is treated as a header cell.

> `InflectionTable.export(table: InflectionTable): InflectionTableJson`

Converts an `InflectionTable` back into GraphQL-compliant table data. Inflected form IDs are preserved whenever possible, which means:

- If a data cell is converted to a header cell and back, its inflected form ID is preserved.
- If a cell moves around in the table, e.g. by adding/removing rows or columns around it, its inflected form ID is also preserved.
- If the cell is deleted and another put in the same place, the ID is reset to null; as far as the table is concerned, it's a new form.

## `InflectionTableMessages`

> `interface InflectionTableMessages`

Contains a number of functions that must be overridden to correctly customize the [inflection table editor](#inflectiontableeditor)'s UI messages. These include normally invisible messages that are only exposed to screen readers.

## `<DefinitionTableEditor>`

The `<DefinitionTableEditor>` component edits the inflected forms of a single definition. It does not allow the structure of the table to be edited in any way. Its purpose is to define custom forms, which are usually irregular inflections. Unlike the [inflection table editor](#inflectiontableeditor), this editor must also know the word's lemma form and its stems, so that it can display default inflections correctly.

See more about inflections in the [@condict/inflect documentation][inflect].

### Examples

```jsx
import {Menu} from '@condict/ui';
import {
  DefinitionTableEditor,
  DefinitionTable,
  DefinitionTableMessages,
} from '@condict/table-editor';

const customForms = new Map<number, string>(...);
const table = DefinitionTable.fromJson(myTableData, customForms);

// A simple editor.
const term = 'mylemma';
const stems = new Map<string, string>([['Stem', 'mystem']]);
<DefinitionTableEditor
  value={table}
  term={term}
  stems={stems}
  onChange={newTable => ...}
/>

// A disabled editor with custom messages.
const xhosa: DefinitionTableMessages = ...;
<DefinitionTableEditor
  value={table}
  term={term}
  stems={stems}
  messages={xhosa}
  disabled
/>
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | [DefinitionTable](#definitiontable) | _none; required_ | The table to be edited. |
| `term` | string | _none; required_ | The lemma form of the definition. |
| `stems` | ReadonlyMap&lt;string, string&gt; | _none; required_ | The definition's stems. If these need to be changed, a new map must be created; the editor will not observe changes to an instance. |
| `className` | string | `undefined` | One or more class names that are forwarded to the underlying element. |
| `disabled` | boolean | `false` | If true, the table editor is disabled. A disabled table editor cannot be focused, its cells cannot be edited, and never shows its context menu. |
| `contextMenuExtra` | node | `undefined` | Additional menu items that are added to the end of the table's context menu. Can be used to inject e.g. Undo/Redo functionality. |
| `messages` | [DefinitionTableMessages](#definitiontablemessages) | `undefined` | The table's UI messages. See the [`DefinitionTableMessages`](#definitiontablemessages) type for more details. |
| `onChange` | function | _none; required_ | Receives changes to the table. If a cell's text is edited, this function is called when the cell is committed (when the cell editor is closed), _not_ on each keystroke. |

Other props are ignored and _not_ forwarded to any underlying component. This component does not forward its ref to anything.

If `term` and `stems` are changed, all automatically inflected forms will be updated, while custom forms will be kept.

## `<DefinitionTableEditor.Commands>`

This component exposes various [commands][ui/commands] for manipulating inflection tables. The component can be put around toolbars, buttons, menus, and anything else that supports Condict UI commands. The following commands are available:

* `deleteSelectedForms`: Marks the selected forms as deleted. The cells' text is replaced by a line, like "—". Note that being deleted is still a custom form.
* `restoreSelectedForms`: Restores all selected forms to the automatically inflected form, thereby removing any custom forms there may be.

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | string or component type | `'div'` | An HTML element name or a React component type that decides what the command group is rendered as. |
| `value` | [InflectionTable](#inflectiontable) | _none; required_ | The inflection table that the commands operate on.
| `disabled` | boolean | `false` | If true, disables all table commands. |
| `onChange` | function | _none; required_ | Receives changes to the table, as a result of executing one of the commands. |

All props except `value` and `onChange` are forwarded to the inner [`<CommandGroup>`][ui/commands/group]. See that documentation for more details.

## `DefinitionTable`

> `type DefinitionTable`
> `const DefinitionTable`

This is the shape of a definition table, containing its rows and cells, as well as the currently selected cells. The exported constant contains two methods for interacting with inflection tables:

> `DefinitionTable.fromJson(rows: DefinitionTableJson, customForms: ReadonlyMap<number, string>): DefinitionTable`

Converts GraphQL-compliant table rows and a map of custom forms into an `DefinitionTable` to be passed into an editor. Any cell that does not have an `inflectedForm` is treated as a header cell. It is an error to pass an inflected form without an ID into this function; the definition table editor cannot define custom forms without an ID.

> `DefinitionTable.exportCustomForms(table: DefinitionTable): Map<number, string>`

Converts a `DefinitionTable` into a map of custom forms. Deleted forms _are_ present in the exported map: their value is the empty string.

## `DefinitionTableMessages`

> `interface DefinitionTableMessages`

Contains a number of functions that must be overridden to correctly customize the [definition table editor](#definitiontableeditor)'s UI messages. These include normally invisible messages that are only exposed to screen readers.

[ui/commands]: ../ui/src/command
[ui/commands/group]: ../ui/src/command#commandgroup
[inflect]: ../inflect
