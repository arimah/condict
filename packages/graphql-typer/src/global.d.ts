export {}; // force ESModule

declare global {
  interface ArrayConstructor {
    // Array.isArray cannot narrow to ReadonlyArray.
    // https://github.com/microsoft/TypeScript/issues/17002
    isArray(arg: ReadonlyArray<unknown> | unknown): arg is ReadonlyArray<unknown>;
  }
}
