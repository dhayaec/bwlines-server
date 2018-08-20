import { Resolver } from './../../typings/graphql-utils';

export const reset: Resolver = (
  _,
  { email }: GQL.IResetOnMutationArguments,
) => {
  return {
    email,
  };
};
