import {IdOf} from '../../graphql';

// Users are not exposed directly in the GraphQL schema. Only mutations for
// logging in, logging out and resuming a session are available. For that
// reason, most types related to users are defined here.

export type UserId = IdOf<'User'>;

export type UserRow = {
  id: UserId;
  name: string;
  password_hash: string;
};

export type UserSessionRow = {
  id: string;
  user_id: UserId;
  expires_at: number;
};

export type NewUserInput = {
  /** The name of the new user. */
  name: string;
  /** The (plain-text) password of the new user. */
  password: string;
};

export type EditUserInput = {
  /** If set, updates the user's name. */
  name?: string | null;
  /**
   * If set, updates the user's password. This is the new plain-text password.
   */
  password?: string | null;
};
