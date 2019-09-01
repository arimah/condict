export const CommonHeader =
  '/* eslint-disable */\n' +
  '\n' +
  '// THIS FILE IS AUTO GENERATED.\n';

export const IdOfDefinition =
  `const IdKind = Symbol();\n` +
  '\n' +
  '// This is a hack to get TypeScript to treat different ID types as distinct.\n' +
  '// The actual value will be a number (hence the `number` part), but by\n' +
  "// pretending there's an extra property that is unique to each type, we can\n" +
  '// get TypeScript to reject invalid ID uses, such as attempting to assign\n' +
  '// a DefinitionId to a LemmaId.\n' +
  'export type IdOf<T extends string> = number & {\n' +
  '  [IdKind]: T;\n' +
  '};\n';
