import {UserInputError} from 'apollo-server';

export type Validator<I, R> = {
  do<U>(step: (value: R, paramName: string) => U): Validator<I, U>;
  validate(value: I): R;
};

const validator = <T>(paramName: string): Validator<T, T> => {
  const chain = <A, B, C>(
    prev: (value: A) => B,
    next: (value: B, paramName: string) => C
  ): Validator<A, C> => {
    const validate = (value: A): C => next(prev(value), paramName);
    return {
      do: <D>(step: (value: C, paramName: string) => D) =>
        chain(validate, step),
      validate,
    };
  };

  return {
    do: <U>(step: (value: T, paramName: string) => U) =>
      chain(v => v, step),
    validate: v => v,
  };
};

export default validator;

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
  (value: T, paramName: string) => {
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
  (value: string, paramName: string) => {
    if (!regex.test(value)) {
      throw new UserInputError(`${paramName}: ${message(value)}`, {
        invalidArgs: [paramName],
      });
    }
    return value;
  };

export const unique = <T, K>(
  currentId: K | null,
  getExistingId: (value: T) => Promise<K | null>,
  message: (value: T) => string
) =>
  async (value: T, paramName: string) => {
    const existingId = await getExistingId(value);
    if (existingId !== null && existingId !== currentId) {
      throw new UserInputError(`${paramName}: ${message(value)}`, {
        invalidArgs: [paramName],
        existingId,
      });
    }
    return value;
  };

// Same reasoning as the IdOf type in ../graphql/types.ts.
const ValidatorKind = Symbol();

// This type can be used by validators to express a validated value of type T,
// as validated by the validator V.
export type Valid<T, V extends string> = T & {
  [ValidatorKind]: V;
};
