# Database schema

This folder houses the database schema. [index.js](./index.js) exports an array of `TableSchema[]`, which is defined in [types.ts](./types.ts).

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

Dates deserve special mention. SQLite has very limited date and time handling. There is no built-in date (or datetime) type, and all date functions operate on strings. We don't anticipate that Condict will be required to perform any particularly complex date handling in queries; at most we'll sort by date, and maybe in the future perform "last x days" filtering. As a result, dates are stored as milliseconds since midnight on 1 January 1970 UTC, matching the JS `Date` class.

In GraphQL, our own `Date` scalar type is sent as such an integer value. This additionally means we incur no penalties from converting and parsing back and forth; everything is just numbers.
