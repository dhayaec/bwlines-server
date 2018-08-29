import { AppResolverMap } from '../../typings/app-utility-types';
import {
  changeEmail,
  changePassword,
  resendVerifySignup,
  sendResetPassword,
  verifyResetPassword,
} from './account-services';
import { getUser } from './get-user';
import { listUsers } from './list-users';
import { login } from './login';
import { logout } from './logout';
import { me } from './me';
import { register } from './register';

export const resolvers: AppResolverMap = {
  Query: {
    me,
    getUser,
    listUsers,
  },
  Mutation: {
    register,
    login,
    logout,
    resendVerifySignup,
    sendResetPassword,
    verifyResetPassword,
    changePassword,
    changeEmail,
  },
};
