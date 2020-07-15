import {UserInputError} from 'apollo-server';
import {hash} from 'bcrypt';

import {Connection} from '../../database';

import validator, {Valid, lengthBetween, unique} from '../validator';
import sizeOfColumn from '../size-of-column';

import {UserId} from './types';

/** A validated and hashed password. */
export type ValidPassword = Valid<string, 'Password'>;

const UserNameMinLength = 3;
const UserNameMaxLength = sizeOfColumn('users', 'name');

export const validateName = (
  db: Connection,
  currentId: UserId | null,
  value: string
): string =>
  validator<string>('name')
    .do(name => name.trim())
    .do(lengthBetween(UserNameMinLength, UserNameMaxLength))
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
      name => `there is already a user with the name '${name}'`
    ))
    .validate(value);

// FIXME: Verify this is a sensible value. Derive automatically based on server?
export const BcryptRounds = 12;

export const validatePassword =
  validator<string>('password')
    .do((password, paramName) => {
      if (password.length < 8) {
        throw new UserInputError('password must be at least 8 characters long', {
          invalidArgs: [paramName],
        });
      }
      if (/^\s+$/.test(password)) {
        throw new UserInputError('password cannot consist of only white space characters', {
          invalidArgs: [paramName],
        });
      }
      return password;
    })
    .do(password => hash(password, BcryptRounds) as Promise<ValidPassword>)
    .validate;
