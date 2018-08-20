import * as bcryptjs from 'bcryptjs';
import { userSessionIdPrefix } from '../../constants';
import { User } from '../../entity/User';
import { Resolver } from './../../typings/graphql-utils';

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

  const { id, name, email: emailAddress } = user;
  session.userId = id;
  session.name = name;
  session.email = emailAddress;

  if (req.sessionID) {
    await redis.lpush(`${userSessionIdPrefix}${user.id}`, req.sessionID);
  }

  return {
    id,
    name,
    email: emailAddress,
  };
};
