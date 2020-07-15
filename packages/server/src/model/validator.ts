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

export type MinLengthMessage<T> = (value: T, minLength: number) => string;

const defaultMinLengthMessage =
  <T>(value: T, minLength: number) =>
    `must have at least ${minLength} character${minLength !== 1 ? 's' : ''}`;

export const minLength = <T extends {length: number}>(
  minLength: number,
  message: MinLengthMessage<T> = defaultMinLengthMessage
) =>
  (value: T, paramName: string): T => {
    if (value.length < minLength) {
      throw new UserInputError(`${paramName}: ${message(value, minLength)}`, {
        invalidArgs: [paramName],
      });
    }
    return value;
  };

export const matches = (
  regex: RegExp,
  message: (value: string) => string
) =>
  (value: string, paramName: string): string => {
    if (!regex.test(value)) {
      throw new UserInputError(`${paramName}: ${message(value)}`, {
        invalidArgs: [paramName],
      });
    }
    return value;
  };

export const unique = <T, K>(
  currentId: K | null,
  getExistingId: (value: T) => K | null,
  message: (value: T) => string
) =>
  (value: T, paramName: string): T => {
    const existingId = getExistingId(value);
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
