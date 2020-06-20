# Transformations

This document summarises the various transformations performed by this package.

## Schemas

Schema definitions are generated for the server.

### Scalar types

| GraphQL type | TS type   |
| ---          | ---       |
| `Boolean`    | `boolean` |
| `Int`        | `number`  |
| `Float`      | `number`  |
| `String`     | `string`  |
| `ID`         | `string`  |

In addition, custom scalar types are handled as follows:

* `scalar SId @id` becomes `type SId = IdOf<'S'>;` (the `Id` suffix is stripped for `IdOf`)
* `scalar S @id` becomes `type S = IdOf<'S'>;`
* `scalar S @id(of: "R")` becomes `type S = IdOf<'R'>;`
* `scalar S @marshal(as: ...)` is transformed according to the marshal type (see the documentation of `@marshal`)
* Scalars without the `@id` or `@marshal` directive: `scalar S` becomes `type S = unknown;`

### Array types

Assuming `T` is a nullable type:

| GraphQL type | TS type         |
| ---          | ---             |
| `[T]`        | `(T \| null)[]` |
| `[T!]`       | `T[]`           |

### Union types

GraphQL `union T = A | B | C;` becomes TS `type T = A | B | C;`.

### Enum types

GraphQL type:

```graphql
enum E { A, B, C }
```

TS type:

```typescript
const enum E {
  A = 'A',
  B = 'B',
  C = 'C',
}
```

Since interoperability with JS is not necessary, a const enum is acceptable and avoids the (minor) performance penalties of using a non-const enum.

### Interface types

Since we know all implementing types by the time the entire schema is parsed, a GraphQL interface becomes a TS union of all implementing types.

GraphQL schema:

```graphql
interface I {
  field: String
}
type T implements I {
  # ...
}
type U implements I {
  # ...
}
```

Resulting TS type for the interface:

```typescript
type I = T | U;
```

### Object types

GraphQL type:

```graphql
type T {
  x: Int
  y: String!
  z(a: Boolean): ID
}
```

TS type:

```typescript
type T = {
  x: number | null;
  y: string;
  z: string | null;
};
```

Each field is mapped to a corresponding TS field with a matching type. Arguments on fields are omitted.

### Input types

GraphQL type:

```graphql
input I {
  x: Int
  y: String!
  z: ID
}
```

TS type:

```typescript
type I = {
  x?: number | null;
  y: string;
  z?: string | null;
};
```

Similar to an object type, each field is mapped to a corresponding TS field. Nullable fields are marked as optional (`?`), as they need not be specified in the request body, and the GraphQL server does not transform `undefined` to `null`.

## Operations

Operation types are generated for two reasons: (1) to capture the result type of an operation (i.e. the types of the values and fields that are selected by a query or mutation result); (2) to encode the input types of an operation (i.e. the arguments sent along with a query or mutation). These two positions will be referred to as _response_ (from the server) and _request_ (to the server), respectively.

Types in response position are derived entirely from the selection set. That is, if you have a type in your schema with fifty fields but only select three in your query, the result type will only include those three fields (along with the fields of nested types, of course).

Types in the request position are almost identical to those generated for the server schema, with the differences that `ID` types can accept `string` as well as `number`, and `undefined` is permitted in some contexts where it isn't otherwise.

Fragments are supported. The fields they select are recursively merged into the object they select on.

### Scalar values

| GraphQL type | TS type (response) | TS type (request)    |
| ---          | ---                | ---                  |
| `Boolean`    | `boolean`          | `boolean`            |
| `Int`        | `number`           | `number`             |
| `Float`      | `number`           | `number`             |
| `String`     | `string`           | `string`             |
| `ID`         | `string`           | `string \| number`   |

As a reminder, "request" means when the type occurs in an input position, i.e. on a query parameter (`$foo: ID`), on a field parameter (`field(foo: ID)`), or on the field of an input type (`input X { foo: ID }`). This distinction is needed because GraphQL accepts both strings and numbers as input values on `ID` typed parameters and input type fields.

In addition, custom scalar types are handled as follows:

* `scalar SId @id` becomes `IdOf<'S'>` (the `Id` suffix is stripped for `IdOf`)
* `scalar S @id` becomes `IdOf<'S'>`
* `scalar S @id(of: "R")` becomes `IdOf<'R'>`
* `scalar S @marshal(as: ...)` is transformed according to the marshal type (see the documentation of `@marshal`)
* Scalars without the `@id` or `@marshal` directive: `scalar S` becomes `unknown`

### Array values

Assuming `T` is a nullable type:

| GraphQL type | TS type (response) | TS type (request)            |
| ---          | ---                | ---                          |
| `[T]`        | `(T \| null)[]`    | `(T \| null \| undefined)[]` |
| `[T!]`       | `T[]`              | `T[]`                        |

Undefined is permitted in request position because `JSON.stringify` turns undefined inside arrays into null.

### Enum values

An enum is generated from the GraphQL schema (as described under [Enum types](#enum-types)), which is referenced where it is used.

Additionally, the custom directive `@restrict` is used to instruct the GraphQL typer that only a subset of the enum values are possible. This directive is implemented only for fields in object types. The purpose is to allow enum-typed fields to be used as discriminants in TypeScript, without having to select `__typename` as well. Example:

```graphql
enum InlineKind { BOLD, ITALIC, LINK }
interface Inline {
  kind: InlineKind!
  text: String!
}
type StyleInline implements Inline {
  kind: InlineKind! @restrict(not: ["LINK"])
  text: String!
}
type LinkInline implements Inline {
  kind: InlineKind! @restrict(only: ["LINK"])
  text: String!
  url: String!
}
extend type Query {
  inlines: [Inline!]!
}

query {
  inlines {
    ... on StyleInline { kind, text }
    ... on LinkInline { kind, text, url }
  }
}
```

This leads to the following result type:

```typescript
const enum InlineKind {
  BOLD = 'BOLD',
  ITALIC = 'ITALIC',
  LINK = 'LINK',
}

type Result = {
  inlines: ({
    kind: InlineKind.BOLD | InlineKind.ITALIC;
    text: string;
  } | {
    kind: InlineKind.LINK;
    text: string;
    url: string;
  })[];
};
```

The `@restrict` directive is _only_ used by the GraphQL typer. Neither the server nor the client verifies that only the permitted enum values are present.

### Union values

Union values only exist in response position. When selecting from a union, the _only_ field you can select on the union itself is `__typename`. Everything else (by design) must be selected through a fragment. If `__typename` is present on the union, it will be expanded as follows:

```graphql
union U = A | B | C
type A {
  a: String!
}
type B {
  b: Int!
}
type C {
  c: Float!
}
type D {
  d: ID!
}
extend type Query {
  u: U!
}

query {
  u {
    __typename
    ... on A { a }
    ... on B { b }
  }
}
```

leads to the following result type:

```typescript
type Result = {
  u: {
    __typename: 'A';
    a: string;
  } | {
    __typename: 'B';
    b: number;
  } | {
    __typename: 'C' | 'D';
  };
};
```

Note that `C` and `D` are included in the result even though neither was explicitly selected. Because `__typename` is present, we must include every known value, since we have no idea exactly what the server returns. The two types that have no corresponding fragments can be folded into a single type in the TS union.

By contrast, if `__typename` is not included directly inside the union:

```graphql
query {
  u1: u {
    ... on A { a }
    ... on B { b }
  }
  u2: u {
    ... on A { __typename, a }
    ... on B { __typename, b }
  }
}
```

leads to:

```typescript
type Result = {
  u1: {
    a: string;
  } | {
    b: number;
  } | {};
  u2: {
    __typename: 'A';
    a: string;
  } | {
    __typename: 'B';
    b: number;
  } | {};
};
```

Note the `{}` at the end of both types. Since `C` and `D` are still possible types, we must encode them somehow; the only way is to indicate that there may be an empty object.

### Interface values

Interfaces are similar to unions, in that we know, after inspecting the entire schema, exactly which types implement an interface. Unlike a union, an interface permits common fields (i.e. fields declared on the interface) to be selected without specialising with a fragment.

```graphql
interface I {
  value: Int!
}
type A implements I {
  value: Int!
  a: String!
}
type B implements I {
  value: Int!
  b: Float!
}
type C implements I {
  value: Int!
  c: ID!
}
type D implements I {
  value: Int!
  d: Int!
}
extend type Query {
  i: I!
}

query {
  i1: i {
    value
  }
  i2: i {
    __typename
    value
  }
  i3: i {
    __typename
    value
    ... on A { a }
    ... on B { b }
  }
  i4: i {
    ... on A { __typename, a }
    ... on B { b }
  }
}
```

becomes:

```typescript
type Result = {
  i1: {
    value: number;
  };
  i2: {
    __typename: 'A' | 'B' | 'C' | 'D';
    value: number;
  };
  i3: {
    __typename: 'A';
    value: number;
    a: string;
  } | {
    __typename: 'B';
    value: number;
    b: string;
  } | {
    __typename: 'C' | 'D';
    value: number;
  };
  i4: {
    __typename: 'A';
    a: string;
  } | {
    b: number;
  } | {};
};
```

Note that common fields are put into each possible type when fragments are present. It would be possible to express it alternatively as `commonFields & (typeA | typeB | ...)`, but in practice that produces somewhat uglier type definitions.

### Object values

Each field is simply selected. Object types do not occur in request position. There is no specialisation or alternation, as with union and interface types.

```graphql
type T {
  id: ID!
  name: String!
  value: Int
}
extend type Query {
  t: T!
}

query {
  t1: t { id }
  t2: t { name, value }
}
```

becomes:

```typescript
type Result = {
  t1: {
    id: string;
  };
  t2: {
    name: string;
    value: number | null;
  };
}
```

### Input values

Input values only occur in request position. Hence, no fields can be selected from them, and they are only used for defining parameter types. The type is compiled as described under [Input types](#input-types) and referenced where needed.

```graphql
input Data {
  id: ID!
  name: String
  value: Int
}
extend type Mutation {
  insertData(data: Data!): Boolean
}

mutation($d: Data!) {
  insertData(data: $d)
}
```

becomes:

```typescript
type Data = {
  id: string | number;
  name?: string | null;
  value?: number | null;
};

type Params = {
  d: Data;
};
type Result = {
  insertData: boolean;
};
```

### `@include` and `@skip`

These two directives cause major challenges for query typing. `@include` and `@skip` directives with a _constant_ condition are supported, and do what you would expect. With a non-constant condition (e.g. `@include(if: $something)`), the GraphQL typer throws an error, as figuring out exactly which fields are present in which circumstances is difficult.
