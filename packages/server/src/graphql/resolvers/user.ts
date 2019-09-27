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
    (_root, {username, password}: LoginArgs, {mut: {UserSessionMut}}) =>
      UserSessionMut.logIn(username, password)
  ),

  logOut: publicMutator(
    (_root, _args, {sessionId, mut: {UserSessionMut}}) => {
      if (sessionId === null) {
        return false;
      }
      return UserSessionMut.logOut(sessionId);
    }
  ),

  resumeSession: publicMutator(
    (_root, _args, {sessionId, mut: {UserSessionMut}}) => {
      if (sessionId === null) {
        return null;
      }
      return UserSessionMut.resumeSession(sessionId);
    }
  ),
};

export default {
  LoginResult,
  Mutation,
};
