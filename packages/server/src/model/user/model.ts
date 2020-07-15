import Model from '../model';

import {UserId, UserRow, UserSessionRow} from './types';

// Batching is unnecessary; these methods are only ever called internally,
// and only with one ID at a time.

class User extends Model {
  public byId(id: UserId): UserRow | null {
    return this.db.get<UserRow>`
      select *
      from users
      where id = ${id}
    `;
  }

  public byIdRequired(id: UserId): UserRow {
    const user = this.byId(id);
    if (!user) {
      throw new Error(`User not found: ${id}`);
    }
    return user;
  }

  public byName(name: string): UserRow | null {
    return this.db.get<UserRow>`
      select *
      from users
      where name = ${name}
    `;
  }

  public byNameRequired(name: string): UserRow {
    const user = this.byName(name);
    if (!user) {
      throw new Error(`User not found: ${name}`);
    }
    return user;
  }
}

class UserSession extends Model {
  public byId(id: string): UserSessionRow | null {
    return this.db.get<UserSessionRow>`
      select *
      from user_sessions
      where id = ${id}
    `;
  }

  public byIdRequired(id: string): UserSessionRow {
    const session = this.byId(id);
    if (!session) {
      throw new Error(`User session not found: ${id}`);
    }
    return session;
  }

  public verify(sessionId: string): boolean {
    const session = this.byId(sessionId);
    const now = Date.now();
    return session !== null && now < session.expires_at;
  }
}

export default {User, UserSession};
