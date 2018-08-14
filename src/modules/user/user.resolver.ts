import { ResolverMap } from 'graphql-utils';

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
    register: (
      _,
      { name, email, password, mobile }: GQL.IRegisterOnMutationArguments
    ) => {
      return {
        name,
        email,
        password,
        mobile,
      };
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
