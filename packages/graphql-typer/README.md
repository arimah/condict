# @condict/graphql-typer

This package generates TypeScript type definitions from a GraphQL schema. It can be used from the command line or through its Node API.

This package is specially adapted for Condict. It is not especially flexible and the output format is not configurable.

## Custom ID types

Condict deals with many kinds of IDs for many kinds of resources. To prevent confusion and errors, this package has support for custom ID types. Any GraphQL scalar type annotated with a directive named `@id` will be treated as follows:

* The generated TypeScript definition will use the special `IdOf<T>` type. It is a `number` value with a hidden field of type `T` (the resource name). The type `IdOf<'X'>` is incompatible with `IdOf<'Y'>`.
* The resource name can be specified with the `of` parameter on the directive: `@id(of: "MyThing")`. Otherwise, it becomes the scalar type name, minus the `Id` suffix, if there is one.

Example transformations:

| GraphQL schema | TypeScript definition |
| --- | --- |
| `scalar LemmaId @id` | `export type LemmaId = IdOf<'Lemma'>;` |
| `scalar NamedId @id(of: "Foo")` | `export type NamedId = IdOf<'Foo'>;` |
| `scalar SomeKey @id` | `export type SomeKey = IdOf<'SomeKey'>;` |
| `scalar MyOwnId @id(of: "MyOwnId")` | `export type MyOwnId = IdOf<'MyOwnId'>;` |

## Command-line usage

```
condict-graphql-typer --schema-dir SCHEMA_DIR --target TARGET_FILE [--include-introspection-types]
```

Builds TypeScript type definitions from all .graphql files in `SCHEMA_DIR` (searched recursively), saving the result in `TARGET_FILE`. If `--include-introspection-types` is set, type definitions for introspection types are emitted as well.

* `--schema-dir SCHEMA_DIR` (alias: `-s`): The directory that is searched for .graphql files. The directory is searched recursively. All .graphql files that are found are concatenated together and parsed as a single string. The order of concatenation is not specified; each .graphql file should be a syntactically valid schema file. The files cannot contain queries, only schema definitions.
* `--target TARGET_FILE` (alias: `-t`): The file that TypeScript definitions are written to. Any existing contents will be overwritten.
* `--include-introspection-types` (alias: `-i`): If set, type definitions for introspection types – such as `__Schema`, `__Type`, `__Directive` – are generated as well. By default, they are skipped.

## Node API

Example:

```js
const gqlTyper = require('@condict/graphql-typer');

const schema = gqlTyper.buildGraphqlSchema('../graphql-schema');
const includeIntrospectionTypes = false;
const definitions = gqlTyper.defineTypes(schema, includeIntrospectionTypes);
console.log(definitions);
```

### `buildGraphqlSchema()`

> `buildGraphqlSchema(schemaDir: string): GraphQLSchema`

Reads all .graphql files in the `schemaDir` directory (searched recursively), and constructs a GraphQL schema instance.

### `findAllGraphqlFiles()`

> `findAllGraphqlFiles(schemaDir: string): string[]`

Returns the full paths of every .graphql file inside `schemaDir` (searched recursively).

### `getIdKind()`

> `getIdKind(type: GraphQLScalarType): string | null`

Given a GraphQL scalar type, determines whether it is a [custom ID type](#custom-id-types) (with the `@id` directive), and if so, gets the name of the resource it belongs to. If the type is not a custom ID type, returns null.

`GraphQLScalarType` does not directly store the type's directives. Instead, they are looked up through the AST node. As a result, this function returns `null` for any scalar type that lacks an AST node.

### `defineTypes()`

> `defineTypes(schema: GraphQLSchema, includeIntrospectionTypes: boolean): string`

Constructs TypeScript definitions for the types in the specified schema, which are returned as a TypeScript source string. If `includeIntrospectionTypes` is true, then type definitions for introspection types – such as `__Schema`, `__Type` and `__Directive` – will be generated as well; otherwise, they are skipped.

More specifically, any type whose name starts with `__` will be considered private to GraphQL, and is skipped when `includeIntrospectionTypes` is false.

### `writeType()`

> `writeType(type: GraphQLType): string`

Returns a TypeScript type name that refers to the specified type. This handles named types as well as lists and non-nullable types. Note that GraphQL types are nullable by default.
