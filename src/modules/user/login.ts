import * as bcryptjs from 'bcryptjs';
import { USER_SESSION_PREFIX } from '../../constants';
import { User } from '../../entity/User';
import { Resolver } from './../../typings/app-utility-types';

export const login: Resolver = async (
  _,
  { email, password }: GQL.ILoginOnMutationArguments,
  { session, redis, req, db },
) => {
  const user = await db.getRepository(User).findOne({ where: { email } });
  if (!user) {
    throw new Error('User does not exists');
  }

  const valid = await bcryptjs.compare(password, user.password);
  if (!valid) {
    throw new Error('Invalid Email or Password');
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
