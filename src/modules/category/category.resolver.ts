import { Category } from './../../entity/Category';
import { AppResolverMap } from './../../typings/app-utility-types';

export const resolvers: AppResolverMap = {
  Query: {
    listCategories: async (_, __, { db }) => {
      const c = db.getRepository(Category).find();
      return c;
    },
  },
  Mutation: {
    addCategory: async (
      _,
      { name }: GQL.IAddCategoryOnMutationArguments,
      { db },
    ) => {
      const c = db.getRepository(Category).create({
        name,
      });
      const category = await c.save();
      return category;
    },
  },
};
