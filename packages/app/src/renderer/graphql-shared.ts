/* eslint-disable */

// THIS FILE IS AUTO GENERATED.

const IdKind = Symbol();

// This is a hack to get TypeScript to treat different ID types as distinct.
// The actual value will be a number (hence the `number` part), but by
// pretending there's an extra property that is unique to each type, we can
// get TypeScript to reject invalid ID uses, such as attempting to assign
// a DefinitionId to a LemmaId.

/** Represents an ID of the specified kind. */
export type IdOf<T extends string> = number & {
  [IdKind]: T;
};

const OperationSymbol = Symbol();
const ArgsSymbol = Symbol();
const ResultSymbol = Symbol();

// Similar to the IdOf type, this is a hack to attach extra metadata to an operation.
// The symbol fields don't actually exist (the value is just a string), but allow us
// to extract the operation kind, and argument and result types from the query.
export type Operation<O extends string, A, R> = string & {
  [OperationSymbol]: O;
  [ArgsSymbol]: A;
  [ResultSymbol]: R;
};

export type OperationArgs<Op> = Op extends Operation<any, infer A, any> ? A : unknown;
export type OperationResult<Op> = Op extends Operation<any, any, infer R> ? R : unknown;

export type Query<A, R> = Operation<'query', A, R>;

export type Mutation<A, R> = Operation<'mutation', A, R>;

