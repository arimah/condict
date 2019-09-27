import {Awaitable} from '../../database/adaptor';

import Model from '../model';

import {UserId, UserRow, UserSessionRow} from './types';

// Batching is unnecessary; these methods are only ever called internally,
// and only with one ID at a time.

class User extends Model {
  public byId(id: UserId): Awaitable<UserRow | null> {
    return this.db.get<UserRow>`
      select *
      from users
      where id = ${id}
    `;
  }

  public async byIdRequired(id: UserId): Promise<UserRow> {
    const user = await this.byId(id);
    if (!user) {
      throw new Error(`User not found: ${id}`);
    }
    return user;
  }

  public byName(name: string): Awaitable<UserRow | null> {
    return this.db.get<UserRow>`
      select *
      from users
      where name = ${name}
    `;
  }

  public async byNameRequired(name: string): Promise<UserRow> {
    const user = await this.byName(name);
    if (!user) {
      throw new Error(`User not found: ${name}`);
    }
    return user;
  }
}

class UserSession extends Model {
  public byId(id: string): Awaitable<UserSessionRow | null> {
    return this.db.get<UserSessionRow>`
      select *
      from user_sessions
      where id = ${id}
    `;
  }

  public async byIdRequired(id: string): Promise<UserSessionRow> {
    const session = await this.byId(id);
    if (!session) {
      throw new Error(`User session not found: ${id}`);
    }
    return session;
  }

  public async verify(sessionId: string): Promise<boolean> {
    const session = await this.byId(sessionId);
    const now = Date.now();
    return session !== null && now < session.expires_at;
  }
}

export default {User, UserSession};
