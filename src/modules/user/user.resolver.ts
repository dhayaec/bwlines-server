import * as bcryptjs from 'bcryptjs';
import { ResolverMap } from 'graphql-utils';
import { errorResponse, userSessionIdPrefix } from '../../constants';
import { User } from '../../entity/User';
import {
  createMiddleware,
  middleware,
  removeAllUsersSessions,
} from '../../utils/user-utils';
import { formatYupError } from '../../utils/utils';
import { userSchema } from '../validation-rules';

export const resolvers: ResolverMap = {
  Query: {
    me: createMiddleware(middleware, (_, __, { session, db }) => {
      if (session) {
        const userRepository = db.getRepository(User);
        return userRepository.findOne({ where: { id: session.userId } });
      }
      return null;
    }),
    getUser: (_, { id }: GQL.IGetUserOnQueryArguments) => User.findOne(id),
    getEmail: (_, { id }: GQL.IGetEmailOnQueryArguments, { db }) => {
      const userRepository = db.getRepository(User);
      return userRepository.findOne({ where: { id } });
    },
  },
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments, { db }) => {
      try {
        await userSchema.validate(args, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }
      const userRepository = db.getRepository(User);
      const { email, password: pass, name } = args;

      const userExists = await userRepository.findOne({ where: { email } });
      if (userExists) {
        throw new Error(`${email} is already registered with us`);
      }

      const user = userRepository.create({
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
      const userRepository = db.getRepository(User);
      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        return { errors: errorResponse };
      }

      const valid = await bcryptjs.compare(password, user.password);
      if (!valid) {
        return { errors: errorResponse };
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
