import {GraphQLError} from 'graphql';

export class AuthenticationError extends GraphQLError {
  public constructor(message: string, extensions?: Record<string, any>) {
    super(message, {
      extensions: {
        code: 'UNAUTHENTICATED',
        ...extensions,
      },
    });
    Object.defineProperty(this, 'name', {value: 'AuthenticationError'});
  }
}

export class UserInputError extends GraphQLError {
  public constructor(message: string, extensions?: Record<string, any>) {
    super(message, {
      extensions: {
        code: 'BAD_USER_INPUT',
        ...extensions,
      },
    });
    Object.defineProperty(this, 'name', {value: 'UserInputError'});
  }
}
