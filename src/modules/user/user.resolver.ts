import { ResolverMap } from '../../../typings/graphql-utils';

export const resolvers: ResolverMap = {
  Query: {
    me: () => {
      return {
        name: 'name',
      };
    },
  },
  Mutation: {
    register: (
      _,
      { name, email, password }: GQL.IRegisterOnMutationArguments
    ) => {
      return {
        name,
        email,
        password,
      };
    },
    login: (_, { email, password }: GQL.ILoginOnMutationArguments) => {
      return {
        email,
        password,
      };
    },
  },
};
