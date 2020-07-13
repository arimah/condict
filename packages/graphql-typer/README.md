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

## Custom scalar marshalling

In addition to the `@id` directive, this package also supports custom marshalling of scalars through the `@marshal` directive. The directive takes a single parameter, `as`, which determines how the scalar is marshalled.

Marshalling affects how values of the type are transferred in JSON payloads (requests and responses), and determines which literal types the scalar accepts in queries and mutations. The table below summarises the `@marshal` types.

| GraphQL schema | Query literal type | JSON payload type | TypeScript type |
| --- | --- | --- |
| `@marshal(as: INT_TYPE)` | integer | number | `number` |
| `@marshal(as: FLOAT_TYPE)` | integer, floating-point | number | `number` |
| `@marshal(as: STRING_TYPE)` | string | string | `string` |

An example:

```graphql
scalar Date @marshal(as: INT_TYPE)

extend type Query {
  nextDay(date: Date!): Date!
}

query {
  nextDay(date: 1592644245435)

  # INT_TYPE only accepts integer literals
  invalid1: nextDay(date: 1592644245435.0)
  invalid2: nextDay(date: "1592644245435")
}
```

## Command-line usage

```shell
condict-graphql-typer --schema-dir=SCHEMA_DIR --target=server --output=OUTPUT_FILE
condict-graphql-typer --schema-dir=SCHEMA_DIR --target=client --src=SRC_DIR --defs=DEFS_FILE
condict-graphql-typer --help
```

Builds TypeScript type definitions from all .graphql files in `SCHEMA_DIR` (searched recursively), saving the result in `OUTPUT_FILE`.

* `--schema-dir SCHEMA_DIR` (alias: `-s`): The directory that is searched for .graphql schema files. The directory is searched recursively. All .graphql files that are found are concatenated together and parsed as a single string. Each .graphql file should be a syntactically valid, self-contained schema file. The files cannot contain queries, only schema definitions.
* `--target <server|client>` (alias: `-t`): Determines whether to write server type definitions (`server`), or client operation type definitions (`client`).
* `--output OUTPUT_FILE` (alias: `-o`): Server only. The file that TypeScript definitions are written to. Any existing contents will be overwritten.
* `--src=SRC_DIR`: Client only. Client only. The source directory that is searched for client .graphql files. Every file named `query.graphql` contains one or more operations (queries, mutations, subscriptions) and receives a generated `query.ts` in the same directory. All other .graphql files are expected to contain fragment definitions, which are made available to all operations across the codebase.
* `--defs=DEFS_FILE` (alias: `-d`): Client only. The path to the shared definitions file, which will receive generated definitions for the `IdOf`, `Query`, `QueryArgs` and `QueryResult` types as well as enum, input and custom ID types.
* `--help` (alias: `-h`): Shows a help screen.

## Node API

Server types example:

```js
const gqlTyper = require('@condict/graphql-typer');

const schema = gqlTyper.buildGraphqlSchema('../graphql-schema');
const definitions = gqlTyper.defineServerTypes(schema);
console.log(definitions); // This value should be saved to a file
```

Client types example:

```js
const gqlTyper = require('@condict/graphql-typer');

const schema = gqlTyper.buildGraphqlSchema('../graphql-schema');
const sharedPath = './graphql-shared.ts';
const srcDir = './src';
gqlTyper.defineClientTypes(schema, sharedPath, srcDir);
```

### `buildGraphqlSchema()`

> `buildGraphqlSchema(schemaDir: string): GraphQLSchema`

Reads all .graphql files in the `schemaDir` directory (searched recursively), and constructs a GraphQL schema instance. If the schema is invalid, an error is thrown.

### `findAllGraphqlFiles()`

> `findAllGraphqlFiles(schemaDir: string): string[]`

Returns the full paths of every .graphql file inside `schemaDir` (searched recursively). Matching paths are sorted alphabetically.

### `getIdKind()`

> `getIdKind(type: GraphQLScalarType): string | null`

Given a GraphQL scalar type, determines whether it is a [custom ID type](#custom-id-types) (with the `@id` directive), and if so, gets the name of the resource it belongs to. If the type is not a custom ID type, returns null.

`GraphQLScalarType` does not directly store the type's directives. Instead, they are looked up through the AST node. As a result, this function returns `null` for any scalar type that lacks an AST node.

### `getMarshalType()`

> `getMarshalType(type: GraphQLScalarType): MarshalType | null`

Given a GraphQL scalar type, determines whether it has a [`@marshal` directive](#custom-scalar-marshalling), and if so, gets the type it should be marshalled as. If the scalar type has no `@marshal` directive, returns null.

`GraphQLScalarType` does not directly store the type's directives. Instead, they are looked up through the AST node. As a result, this function returns `null` for any scalar type that lacks an AST node.

### `defineServerTypes()`

> `defineServerTypes(schema: GraphQLSchema): string`

Constructs TypeScript definitions for the types in the specified schema, which are returned as a TypeScript source string. Note that only user-defined types are exported; introspection types like `__Type` and `__Schema` are always skipped.

### `defineClientTypes()`

> `defineClientTypes(schema: GraphQLSchema, sharedPath: string, srcDir: string): void`

Constructs TypeScript definitions for all operations in every applicable .graphql file in `srcDir`, based on `schema`. Shared type definitions (the `IdOf`, `Query`, `QueryArgs` and `QueryResult` types) are put in `sharedPath`.

Note that unlike [`getServerTypes()`](#getservertypes), this function writes the result to each applicable file, rather than returning a string with definitions.
