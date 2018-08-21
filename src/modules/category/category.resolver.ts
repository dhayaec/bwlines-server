import { Category } from './../../entity/Category';
import { ResolverMap } from './../../typings/graphql-utils';

export const resolvers: ResolverMap = {
  Query: {
    list: async (_, __, { db }) => {
      const c = db.getRepository(Category).find();
      return c;
    },
  },
  Mutation: {
    add: async (_, { name }: GQL.IAddOnMutationArguments, { db }) => {
      const c = db.getRepository(Category).create({
        name,
      });
      const category = await c.save();
      return category;
    },
  },
};
