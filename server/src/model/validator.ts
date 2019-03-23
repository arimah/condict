import {UserInputError} from 'apollo-server';

export interface Validator<I, R> {
  do<U>(step: (paramName: string, value: R) => U): Validator<I, U>;
  validate(value: I): R;
}

const validator = <T>(paramName: string): Validator<T, T> => {
  const chain = <A, B, C>(
    prev: (value: A) => B,
    next: (paramName: string, value: B) => C
  ): Validator<A, C> => {
    const validate = (value: A): C => next(paramName, prev(value));
    return {
      do: <D>(step: (paramName: string, value: C) => D) =>
        chain(validate, step),
      validate,
    };
  };

  return {
    do: <U>(step: (paramName: string, value: T) => U) =>
      chain(v => v, step),
    validate: v => v,
  };
};

export default validator;

export const map = <T, U>(f: (value: T) => U) =>
  (_paramName: string, value: T) =>
    f(value);

export type LengthBetweenMessage<T> = (
  value: T,
  minLength: number,
  maxLength: number
) => string;

const defaultLengthBetweenMessage =
  <T>(value: T, minLength: number, maxLength: number) =>
    `must be between ${minLength} and ${maxLength} characters`;

export const lengthBetween = <T extends {length: number}>(
  minLength: number,
  maxLength: number,
  message: LengthBetweenMessage<T> = defaultLengthBetweenMessage
) =>
  (paramName: string, value: T) => {
    if (value.length < minLength || value.length > maxLength) {
      throw new UserInputError(`${paramName}: ${message(value, minLength, maxLength)}`, {
        invalidArgs: [paramName],
      });
    }
    return value;
  };

export const matches = (
  regex: RegExp,
  message: (value: string) => string
) =>
  (paramName: string, value: string) => {
    if (!regex.test(value)) {
      throw new UserInputError(`${paramName}: ${message(value)}`, {
        invalidArgs: [paramName],
      });
    }
    return value;
  };

const defaultUniqueMessage = <T>(value: T) =>
  `value already in use: ${value}`;

export const unique = <T, K>(
  currentId: K | null,
  getExistingId: (value: T) => Promise<K | null>,
  message: (value: T) => string = defaultUniqueMessage
) =>
  async (paramName: string, value: T) => {
    const existingId = await getExistingId(value);
    if (existingId !== null && existingId !== currentId) {
      throw new UserInputError(`${paramName}: ${message(value)}`, {
        invalidArgs: [paramName],
        existingId,
      });
    }
    return value;
  };
