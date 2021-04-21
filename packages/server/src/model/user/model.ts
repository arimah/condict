import {DataReader} from '../../database';

import {UserId, UserRow, UserSessionRow} from './types';

// Batching is unnecessary; these methods are only ever called internally,
// and only with one ID at a time.

const User = {
  byId(db: DataReader, id: UserId): UserRow | null {
    return db.get<UserRow>`
      select *
      from users
      where id = ${id}
    `;
  },

  byIdRequired(db: DataReader, id: UserId): UserRow {
    const user = this.byId(db, id);
    if (!user) {
      throw new Error(`User not found: ${id}`);
    }
    return user;
  },

  byName(db: DataReader, name: string): UserRow | null {
    return db.get<UserRow>`
      select *
      from users
      where name = ${name}
    `;
  },

  byNameRequired(db: DataReader, name: string): UserRow {
    const user = this.byName(db, name);
    if (!user) {
      throw new Error(`User not found: ${name}`);
    }
    return user;
  },
} as const;

const UserSession = {
  byId(db: DataReader, id: string): UserSessionRow | null {
    return db.get<UserSessionRow>`
      select *
      from user_sessions
      where id = ${id}
    `;
  },

  byIdRequired(db: DataReader, id: string): UserSessionRow {
    const session = this.byId(db, id);
    if (!session) {
      throw new Error(`User session not found: ${id}`);
    }
    return session;
  },

  verify(db: DataReader, sessionId: string): boolean {
    const session = this.byId(db, sessionId);
    const now = Date.now();
    return session !== null && now < session.expires_at;
  },
} as const;

export {User, UserSession};
