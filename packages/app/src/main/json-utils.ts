export interface PlainObject {
  [key: string]: unknown;
}

export const isPlainObject = (value: any): value is PlainObject =>
  value != null &&
  typeof value === 'object' &&
  !Array.isArray(value);
