import * as bcryptjs from 'bcryptjs';
import { ResolverMap } from 'graphql-utils';
import * as yup from 'yup';
import { userSessionIdPrefix } from '../../constants';
import { User } from '../../entity/User';
import { createMiddleware, middleware } from '../../utils/user-utils';
import { formatYupError } from '../../utils/utils';

const schema = yup.object().shape({
  name: yup
    .string()
    .min(3)
    .max(100)
    .required(),
  email: yup
    .string()
    .min(6)
    .max(255)
    .email(),
  password: yup
    .string()
    .min(6)
    .max(255)
    .required(),
});

const errorResponse = [
  {
    path: 'email',
    message: 'invalid email',
  },
];

export const resolvers: ResolverMap = {
  Query: {
    me: createMiddleware(middleware, (_, __, { session }) => {
      return User.findOne({ where: { id: session.userId } });
    }),
    getUser: (_, { id }: GQL.IGetUserOnQueryArguments) => User.findOne(id),
  },
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments) => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      const { email, password: pass, name } = args;

      const user = User.create({
        name,
        email,
        password: pass,
      });
      const userData = await user.save();
      const { password, ...otherFields } = userData;
      return otherFields;
    },
    login: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session, redis, req }
    ) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return errorResponse;
      }

      const valid = await bcryptjs.compare(password, user.password);
      if (!valid) {
        return errorResponse;
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
  },
};
