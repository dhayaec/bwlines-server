import { AppResolverMap } from '../../typings/app-utility-types';
import { getUser } from './get-user';
import { login } from './login';
import { logout } from './logout';
import { me } from './me';
import { register } from './register';

export const resolvers: AppResolverMap = {
  Query: {
    me,
    getUser,
  },
  Mutation: {
    register,
    login,
    logout,
  },
};
