import * as bcryptjs from 'bcryptjs';
import { USER_SESSION_PREFIX } from '../../constants';
import { User } from '../../entity/User';
import { ERROR_INVALID_LOGIN, ERROR_USER_NOT_FOUND } from '../../utils/errors';
import { Resolver } from './../../typings/app-utility-types';

export const login: Resolver = async (
  _,
  { email, password }: GQL.ILoginOnMutationArguments,
  { session, redis, req, db },
) => {
  const user = await db.getRepository(User).findOne({ where: { email } });
  if (!user) {
    throw new Error(ERROR_USER_NOT_FOUND);
  }

  const valid = await bcryptjs.compare(password, user.password);
  if (!valid) {
    throw new Error(ERROR_INVALID_LOGIN);
  }

  const { id, name, email: emailAddress, isAdmin } = user;
  session.userId = id;
  session.name = name;
  session.email = emailAddress;
  session.isAdmin = isAdmin;

  if (req.sessionID) {
    await redis.lpush(`${USER_SESSION_PREFIX}${user.id}`, req.sessionID);
  }

  return user;
};
