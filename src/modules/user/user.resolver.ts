import { ResolverMap } from 'graphql-utils';
import { getUser } from './get-user';
import { login } from './login';
import { logout } from './logout';
import { me } from './me';
import { register } from './register';
import { reset } from './reset';

export const resolvers: ResolverMap = {
  Query: {
    me,
    getUser,
  },
  Mutation: {
    register,
    login,
    logout,
    reset,
  },
};
