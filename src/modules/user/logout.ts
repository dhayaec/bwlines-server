import { removeAllUsersSessions } from '../../utils/user-utils';
import { Resolver } from './../../typings/app-utility-types';

export const logout: Resolver = async (_, __, { session, redis }) => {
  const { userId } = session;
  if (userId) {
    removeAllUsersSessions(userId, redis);
    session.destroy(err => {
      if (err) {
        console.log(err);
      }
    });
  }
  return userId !== '';
};
