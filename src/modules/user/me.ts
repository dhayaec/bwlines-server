import { User } from '../../entity/User';
import { createMiddleware, middleware } from '../../utils/user-utils';
import { Resolver } from './../../typings/app-utility-types';

export const me: Resolver = createMiddleware(
  middleware,
  (_, __, { session, db }) => {
    return db.getRepository(User).findOne({ where: { id: session.userId } });
  },
);
