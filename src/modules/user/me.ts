import { User } from '../../entity/User';
import { createMiddleware, middleware } from '../../utils/user-utils';
import { Resolver } from './../../typings/graphql-utils';

export const me: Resolver = createMiddleware(
  middleware,
  (_, __, { session, db }) => {
    if (session) {
      return db.getRepository(User).findOne({ where: { id: session.userId } });
    }
    return null;
  },
);
