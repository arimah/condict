import {UserInputError} from '../errors';

export type Validator<I, R> = {
  readonly do: <U>(
    step: (value: R, paramName: string) => U
  ) => Validator<I, U>;
  readonly validate: (value: I) => R;
};

export type Message<T> = string | ((value: T) => string);

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

const getMessage = <T>(message: Message<T>, value: T): string =>
  typeof message === 'function'
    ? message(value)
    : message;

export const minLength = <T extends {length: number}>(
  minLength: number,
  message: Message<T>
) =>
  (value: T, paramName: string): T => {
    if (value.length < minLength) {
      throw new UserInputError(getMessage(message, value), {
        invalidArgs: [paramName],
      });
    }
    return value;
  };

export const matches = (
  regex: RegExp,
  message: Message<string>
) =>
  (value: string, paramName: string): string => {
    if (!regex.test(value)) {
      throw new UserInputError(getMessage(message, value), {
        invalidArgs: [paramName],
      });
    }
    return value;
  };

export const unique = <T, K>(
  currentId: K | null,
  getExistingId: (value: T) => K | null,
  message: Message<T>
) =>
  (value: T, paramName: string): T => {
    const existingId = getExistingId(value);
    if (existingId !== null && existingId !== currentId) {
      throw new UserInputError(getMessage(message, value), {
        invalidArgs: [paramName],
        existingId,
      });
    }
    return value;
  };

// Same reasoning as the IdOf type in ../graphql/types.ts.
declare const ValidatorKind: unique symbol;

// This type can be used by validators to express a validated value of type T,
// as validated by the validator V.
export type Valid<T, V extends string> = T & {
  [ValidatorKind]: V;
};
