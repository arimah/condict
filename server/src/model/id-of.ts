class IdBase<T extends string> {
  private kind: T | null = null;
}

// This is a hack to get TypeScript to treat different ID types as distinct.
// The actual value will be a number (hence the `number` part), but by
// pretending there's an extra `kind` property that is unique to each type,
// we can get TypeScript to reject invalid ID uses, such as attempting to
// assign a DefinitionId to a LemmaId.
// If this were Rust, we would just use a transparent wrapper type, but alas.
export type IdOf<T extends string> = number & IdBase<T>;

// This type is similar to the above, but actually contains a string rather
// than a number. As the name suggests, it is used for GraphQL input types,
// as the GraphQL `ID` type is a string.
export type InputIdOf<T extends string> = string & IdBase<T>;

export function toNumberId<T extends string>(id: InputIdOf<T>): IdOf<T> {
  return +id as IdOf<T>;
}
