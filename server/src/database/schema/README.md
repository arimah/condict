# Database schema

This folder houses the database schema. [index.js](./index.js) exports [an array of table definitions (`TableSchema[]`)](#tableschema).

Some general notes about the database design:

* We use exclusively `lower_snake_case` for table and column names. This avoids a range of problems with database engines that feel like case-folding names, particularly column names. Since JS is case-sensitive, we need our column names to be perfectly predictable.
* Tables names are plural, to the greatest extent possible (`schema_info` is a notable exception). The table name makes no distinction between one-to-one, one-to-many, many-to-one and many-to-many mappings.
* The auto-incremented numeric primary key column is always called `id`. Any column named `id` is the primary key, auto-incremented, and numeric.
* Every column that references an ID column ends with `_id`.
* Foreign keys are awesome. Any column that references another gets a foreign key.
* Only reference ID columns.
* We use `cascade` on delete when the referencing column is clearly "owned" by the table it references. Examples:
  - A definition description is "owned" by the definition it belongs to, so `cascade` is appropriate.
  - A definition is _not_ owned by its part of speech; it merely uses it. Deleting the part of speech should not delete the definition, so `restrict` is correct here.
* Use `unique` constraints to ensure _correctness_, never merely as a performance optimisation.
* Put an index on any column that is used in a `where` clause. If multiple columns are commonly used together, consider using a composite index.

The rest of this document describes the structure of the table definition types.

## `TableSchema`

Defines the structure of a table.

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | The name of the table. |
| `comment` | `string` | A comment that describes the purpose of the table and any design rationales that are worth highlighting. The comment is intended to help anyone who looks through the database in a client, that is, without having the code handy. If the database engine does not support comments, this property is ignored by the adaptor. |
| `columns` | [`ColumnSchema[]`](#columnschema) | The columns of the table. This array must not be empty. |
| `primaryKey` | [`IndexedColumn`](#indexedcolumn) | The column or columns that make up the primary key of the table. Every table must have a primary key, but it does not have to be an auto-incremented ID column. |
| `unique` | [`IndexedColumn[]`](#indexedcolumn) | Optional. Columns that will receive the `UNIQUE` constraint. Note that each value in the array can be a single column name or a list of multiple columns. |
| `index` | [`IndexedColumn[]`](#indexedcolumn) | Optional. Columns that will be indexed (non-`UNIQUE`). Note that each value in the array can be a single column name or a list of multiple columns. |
| `preImport` | `(db: DatabaseConnection, row: any) => Promise<void>` | Optional. A function that performs additional validation on a row before it is imported, such as checking that a unique value constraint is not violated. If the promise is rejected, the import is aborted. If the promise resolves, the value is ignored. |

## `IndexedColumn`

The `IndexedColumn` type is a union of the following types:

* `string`: A single column name.
* `string[]`: A non-empty list of column names (`string[]`), usually two or more.

Example:

```js
const myTable = {
  name: 'things',
  comment: 'Things and stuff.',
  columns: [...],
  index: [
    'foreign_id', // Single column.
    ['foo_id', 'name'], // Multiple columns.
  ],
};
```

## `ColumnSchema`

Defines the structure of a column within a table.

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | The name of the column. |
| `comment` | `string` | A comment that describes the purpose of the column. See the `comment` column in [`TableSchema`](#tableschema). |
| `type` | [`ColumnType`](#columntype) | The type of the column. If the column references a foreign key (`references` is set), then the type is taken from the referenced column, and this property is optional. Otherwise the type is required. |
| `size` | `number` | The size of the column, whose meaning varies according to its type. For integer columns, it is the size of the column in bits. For variable character columns, it is the maximum size of the column in Unicode code points. See more under [`ColumnType`](#columntype). |
| `collate` | [`Collation`](#collation) | On columns of a character type, defines the collation of the column. See more under [`Collation`](#collation). |
| `default` | `any` | Optional. The default value of the column, if applicable. If omitted, the column has no default value, the exact meaning of which varies between database engines. Most columns have no default value. |
| `references` | [`ForeignKeyRef`](#foreignkeyref) | Optional. The foreign key referenced by the column. If omitted, the column is not a foreign key. |
| `contentReferences` | [`ForeignKeyRef[]`](#foreignkeyref) | Optional. Foreign keys referenced by some part of the content of the column. This is used for JSON columns that may contain IDs of foreign columns. For example, an inflection table's layout (a JSON object) references inflected forms by ID. This property must list _all_ tables that could be referenced by the column. |
| `export` | `(value: any, newIds: NewIdMap) => any` | Optional. A function that transforms the column value before it is exported. The first argument is the column value. The second argument contains new values of ID columns for previously exported tables; see more under [`NewIdMap`](#newidmap). The return value is any value that can be serialized as JSON (arrays and objects are fine). |
| `import` | `(value: any, newIds: NewIdMap) => any` | Optional. A function that transforms the column value before it is imported. The arguments are the same as for the `export` function. The return value must be compatible with the column type. |

The `export` and `import` functions are primarily used for updating IDs contained within JSON columns.

## `ColumnType`

The `ColumnType` type is a union of the following values:

* `'id'`: An integer type suitable for use as an ID. The database adaptor determines the exact type, but it is guaranteed to have at least unsigned 32-bit integer range.
* `'boolean'`: A boolean type. Only 0 and 1 should be considered valid values for boolean columns.
* `'unsigned int'`: An unsigned integer type. The `size` property on the [column definition](#columnschema) specifies the minimum required size, in bits, of the column.
* `'varchar'`: A variable-size character type. The `size` property on the column definition specifies the maximum length, in number of Unicode code points, of the column.
* `'json'`: A type suitable for storing JSON-serialized data. The JSON data is passed to the adaptor as a string. The `size` property is _not_ applicable to columns of this type.

## `Collation`

The `Collation` type is a union of the following values:

* `'unicode'`: A case-insensitive, Unicode-aware collation. The collation uses language-agnostic case folding rules (`i`&nbsp;=&nbsp;`I`) and does _not_ ignore diacritics (`a`&nbsp;≠&nbsp;`á`) or punctuation. The sort order will inevitably be wrong for many languages, but the default Unicode order is seen as the least bad alternative. This is usually the most suitable collation for user-entered text that needs to be unique, e.g. names of languages.
* `'binary'`: A case-sensitive binary collation. It compares text by exact binary contents.

## `ForeignKeyRef`

A reference to a foreign key.

| Property | Type | Description |
| --- | --- | --- |
| `table` | `string` | The name of the referenced table. |
| `column` | `string` | The name of the referenced column. |
| `onDelete` | `'restrict' \| 'cascade'` | Optional. Determines how to handle deletions of the referenced row. `'cascade'` means this row is deleted when the referenced row is. `'restrict'` means the referenced row cannot be deleted if it is referenced by this foreign key. If omitted, the default is `'restrict'`. This property is ignored on foreign key references inside [`contentReferences`](#columnschema). |

## `NewIdMap`

When the database is exported, auto-incremented IDs are _not_ preserved. Rather than messing up references to ID columns, the exporter and importer rewrite IDs to their new values. The `NewIdMap` type contains a mapping from old ID to new ID, for each table. It is an object where the key is a table name and the value is a `Map<number, number>`.

See [inline-refs.js](./inline-refs.js) for an example of how this value can be used.
