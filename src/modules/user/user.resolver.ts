import { ResolverMap } from 'graphql-utils';
import { User } from '../../entity/User';

export const resolvers: ResolverMap = {
  Query: {
    me: () => {
      return {
        name: 'name',
      };
    },
    getUser: (_, { id }: GQL.IGetUserOnQueryArguments) => {
      return {
        id,
        name: 'some',
        email: 'another',
      };
    },
  },
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments) => {
      const { email, password } = args;

      const user = User.create({
        email,
        password,
      });
      const savedUser = await user.save();
      return savedUser;
    },
    login: (_, { email, password }: GQL.ILoginOnMutationArguments) => {
      return {
        email,
        password,
      };
    },
    reset: (_, { email }: GQL.IResetOnMutationArguments) => {
      return {
        email,
      };
    },
  },
};
