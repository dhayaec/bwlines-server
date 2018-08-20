import * as bcryptjs from 'bcryptjs';
import { ResolverMap } from 'graphql-utils';
import { userSessionIdPrefix } from '../../constants';
import { User } from '../../entity/User';
import {
  createMiddleware,
  middleware,
  removeAllUsersSessions,
} from '../../utils/user-utils';
import { formatYupError } from '../../utils/utils';
import { userSchema } from '../validation-rules';
import { InputValidationError } from './../../utils/errors';

export const resolvers: ResolverMap = {
  Query: {
    me: createMiddleware(middleware, (_, __, { session, db }) => {
      if (session) {
        return db
          .getRepository(User)
          .findOne({ where: { id: session.userId } });
      }
      return null;
    }),
    getUser: async (_, { id }: GQL.IGetUserOnQueryArguments, { db }) => {
      if (db) {
        return await db.getRepository(User).findOne(id);
      }
      return null;
    },
  },
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments, { db }) => {
      try {
        await userSchema.validate(args, { abortEarly: false });
      } catch (err) {
        const errors = formatYupError(err);

        throw new InputValidationError({
          data: errors,
        });
      }

      const { email, password: pass, name } = args;

      const userExists = await db
        .getRepository(User)
        .findOne({ where: { email } });
      if (userExists) {
        throw new Error(`${email} is already registered with us`);
      }

      const user = db.getRepository(User).create({
        name: name.trim(),
        email: email.trim(),
        password: pass,
      });

      const userData = await user.save();
      const { password, ...otherFields } = userData;
      return otherFields;
    },
    login: async (
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
    },
    reset: (_, { email }: GQL.IResetOnMutationArguments) => {
      return {
        email,
      };
    },
    logout: async (_, __, { session, redis }) => {
      const { userId } = session;
      if (userId) {
        removeAllUsersSessions(userId, redis);
        session.destroy(err => {
          if (err) {
            console.log(err);
          }
        });
      }
      return userId;
    },
  },
};
