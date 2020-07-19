import {UserSessionMut} from '../../model';

import {LoginResult as LoginResultType} from '../types';

import {ResolversFor, Mutators} from './types';
import {publicMutator} from '../helpers';

const LoginResult: ResolversFor<LoginResultType, LoginResultType> = {
  __resolveType: p => 'reason' in p ? 'FailedLogin' : 'UserSession',
};

type LoginArgs = {
  username: string;
  password: string;
};

const Mutation: Mutators = {
  logIn: publicMutator(
    (_root, {username, password}: LoginArgs, {db}) =>
      UserSessionMut.logIn(db, username, password)
  ),

  logOut: publicMutator(
    (_root, _args, {sessionId, db}) => {
      if (sessionId === null) {
        return false;
      }
      return UserSessionMut.logOut(db, sessionId);
    }
  ),

  resumeSession: publicMutator(
    (_root, _args, {sessionId, db}) => {
      if (sessionId === null) {
        return null;
      }
      return UserSessionMut.resumeSession(db, sessionId);
    }
  ),
};

export default {
  LoginResult,
  Mutation,
};
