import {compare, hash} from 'bcrypt';
import {nanoid} from 'nanoid';

import {Connection} from '../../database';
import {LoginResult, UserSession as UserSessionType} from '../../graphql';

import FieldSet from '../field-set';

import {User, UserSession} from './model';
import {UserId, UserRow, NewUserInput, EditUserInput} from './types';
import {validateName, validatePassword, BcryptRounds} from './validators';

const UserMut = {
  async insert(db: Connection, data: NewUserInput): Promise<UserRow> {
    const {name, password} = data;

    // Note: validatePassword also hashes the password.
    const validName = validateName(db, null, name);
    const validPassword = await validatePassword(password);

    const {insertId: id} = db.exec<UserId>`
      insert into users (name, password_hash)
      values (${validName}, ${validPassword})
    `;

    return User.byIdRequired(db, id);
  },

  async update(
    db: Connection,
    id: UserId,
    data: EditUserInput
  ): Promise<UserRow> {
    const {name, password} = data;

    const user = User.byIdRequired(db, id);

    const newFields = new FieldSet<UserRow>();
    if (name && name !== user.name) {
      newFields.set('name', validateName(db, id, name));
    }
    if (password) {
      newFields.set('password_hash', await validatePassword(password));
    }

    if (newFields.hasValues) {
      db.exec`
        update users
        set ${newFields}
        where id = ${id}
      `;
    }
    return User.byIdRequired(db, id);
  },

  delete(db: Connection, id: UserId): boolean {
    const {affectedRows} = db.exec`
      delete from users
      where id = ${id}
    `;
    return affectedRows > 0;
  },
} as const;

const UserSessionMut = {
  /**
   * The default session duration. Sessions can be extended by `resumeSession`.
   * Equal to 30 days in milliseconds.
   */
  sessionDuration: 30 * 24 * 60 * 60 * 1000,

  async logIn(
    db: Connection,
    username: string,
    password: string
  ): Promise<LoginResult> {
    const user = User.byName(db, username);
    if (!user) {
      // Forcefully hash the submitted password, to make brute-force user
      // discovery much more difficult. It's basically just a delay.
      await hash(password, BcryptRounds);
      return {reason: 'USER_NOT_FOUND'};
    }

    const passwordMatches = await compare(password, user.password_hash);
    if (!passwordMatches) {
      return {reason: 'PASSWORD_MISMATCH'};
    }

    // Username and password match. We can create the session.
    const sessionId = nanoid();
    const expiresAt = Date.now() + this.sessionDuration;
    db.exec`
      insert into user_sessions (id, user_id, expires_at)
      values (${sessionId}, ${user.id}, ${expiresAt})
    `;

    return {
      sessionId,
      username: user.name,
      expiresAt,
    };
  },

  logOut(db: Connection, sessionId: string): boolean {
    const {affectedRows} = db.exec`
      delete from user_sessions
      where id = ${sessionId}
    `;
    return affectedRows > 0;
  },

  resumeSession(db: Connection, sessionId: string): UserSessionType | null {
    const now = Date.now();
    const session = UserSession.byId(db, sessionId);

    if (session && now < session.expires_at) {
      const user = User.byIdRequired(db, session.user_id);

      const expiresAt = now + this.sessionDuration;
      db.exec`
        update user_sessions
        set expires_at = ${expiresAt}
        where id = ${sessionId}
      `;

      return {
        sessionId: session.id,
        username: user.name,
        expiresAt,
      };
    }
    return null;
  },
} as const;

export {UserMut, UserSessionMut};
