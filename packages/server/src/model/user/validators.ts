import {hash} from 'bcrypt';

import {DataReader} from '../../database';
import {UserInputError} from '../../errors';

import validator, {Valid, minLength, unique} from '../validator';

import {UserId} from './types';

/** A validated and hashed password. */
export type ValidPassword = Valid<string, 'Password'>;

const UserNameMinLength = 3;

export const validateName = (
  db: DataReader,
  currentId: UserId | null,
  value: string
): string =>
  validator<string>('name')
    .do(name => name.trim())
    .do(minLength(
      UserNameMinLength,
      `User name must be at least ${UserNameMinLength} characters long`
    ))
    .do(unique(
      currentId,
      name => {
        const row = db.get<{id: UserId}>`
          select id
          from users
          where name = ${name}
        `;
        return row ? row.id : null;
      },
      name => `There is already a user with the name '${name}'`
    ))
    .validate(value);

// FIXME: Verify this is a sensible value. Derive automatically based on server?
export const BcryptRounds = 12;

export const validatePassword =
  validator<string>('password')
    .do((password, paramName) => {
      if (password.length < 8) {
        throw new UserInputError('User password must be at least 8 characters long', {
          invalidArgs: [paramName],
        });
      }
      if (/^\s+$/.test(password)) {
        throw new UserInputError('User password cannot consist of only white space characters', {
          invalidArgs: [paramName],
        });
      }
      return password;
    })
    .do(password => hash(password, BcryptRounds) as Promise<ValidPassword>)
    .validate;
