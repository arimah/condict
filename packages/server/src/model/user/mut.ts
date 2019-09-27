import {compare} from 'bcrypt';
import nanoid from 'nanoid';

import {
  LoginResult,
  LoginFailureReason,
  UserSession as UserSessionType,
} from '../../graphql/types';

import Mutator from '../mutator';
import FieldSet from '../field-set';

import {UserId, UserRow, NewUserInput, EditUserInput} from './types';
import {validateName, validatePassword} from './validators';

class UserMut extends Mutator {
  public async insert({name, password}: NewUserInput): Promise<UserRow> {
    const {db} = this;
    const {User} = this.model;

    // Note: validatePassword also hashes the password.
    const [
      validName,
      validPassword,
    ] = await Promise.all([
      validateName(db, null, name),
      validatePassword(password),
    ]);

    const {insertId: id} = await db.exec<UserId>`
      insert into users (name, password_hash)
      values (${validName}, ${validPassword})
    `;

    return User.byIdRequired(id);
  }

  public async update(
    id: UserId,
    {name, password}: EditUserInput
  ): Promise<UserRow> {
    const {db} = this;
    const {User} = this.model;

    const user = await User.byIdRequired(id);

    const newFields = new FieldSet<UserRow>();
    if (name && name !== user.name) {
      newFields.set('name', await validateName(db, id, name));
    }
    if (password) {
      newFields.set('password_hash', await validatePassword(password));
    }

    if (newFields.hasValues) {
      await db.exec`
        update users
        set ${newFields}
        where id = ${id}
      `;
    }
    return User.byIdRequired(id);
  }

  public async delete(id: UserId): Promise<boolean> {
    const {db} = this;

    const {affectedRows} = await db.exec`
      delete from users
      where id = ${id}
    `;
    return affectedRows > 0;
  }
}

class UserSessionMut extends Mutator {
  /**
   * The default session duration. Sessions can be extended by `resumeSession`.
   * Equal to 30 days in milliseconds.
   */
  public readonly sessionDuration = 30 * 24 * 60 * 60 * 1000;

  public async logIn(
    username: string,
    password: string
  ): Promise<LoginResult> {
    const {db} = this;
    const {User} = this.model;

    const user = await User.byName(username);
    if (!user) {
      return {reason: LoginFailureReason.USER_NOT_FOUND};
    }

    const passwordMatches = await compare(password, user.password_hash);
    if (!passwordMatches) {
      return {reason: LoginFailureReason.PASSWORD_MISMATCH};
    }

    // Username and password match. We can create the session.
    const sessionId = nanoid();
    const expiresAt = Date.now() + this.sessionDuration;
    await db.exec`
      insert into user_sessions (id, user_id, expires_at)
      values (${sessionId}, ${user.id}, ${expiresAt})
    `;

    return {
      sessionId,
      username: user.name,
      expiresAt,
    };
  }

  public async logOut(sessionId: string): Promise<boolean> {
    const {affectedRows} = await this.db.exec`
      delete from user_sessions
      where id = ${sessionId}
    `;
    return affectedRows > 0;
  }

  public async resumeSession(sessionId: string): Promise<UserSessionType | null> {
    const {db} = this;
    const {User, UserSession} = this.model;

    const now = Date.now();
    const session = await UserSession.byId(sessionId);

    if (session && now < session.expires_at) {
      const user = await User.byIdRequired(session.user_id);

      let expiresAt = now + this.sessionDuration;
      await db.exec`
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
  }
}

export default {UserMut, UserSessionMut};
