import { Category } from './../../entity/Category';
import { AppResolverMap } from './../../typings/app-utility-types';
import { AuthenticationError, AuthorizationError } from './../../utils/errors';

export const resolvers: AppResolverMap = {
  Query: {
    getCategoryById: async (
      _,
      { id }: GQL.IGetCategoryByIdOnQueryArguments,
      { db },
    ) => {
      return await db.getRepository(Category).findOne(id);
    },
    listMainCategories: async (_, __, { db }) => {
      return await db.getTreeRepository(Category).findRoots();
    },
    getChildCategories: async (
      _,
      { id }: GQL.IGetChildCategoriesOnQueryArguments,
      { db },
    ) => {
      const m = await db.getRepository(Category).findOne(id);

      if (!m) {
        throw new Error('Invalid category');
      }
      return await db.getTreeRepository(Category).findDescendantsTree(m);
    },
    getBreadCrumbPath: async (
      _,
      { id }: GQL.IGetBreadCrumbPathOnQueryArguments,
      { db },
    ) => {
      const m = await db.getRepository(Category).findOne(id);

      if (!m) {
        throw new Error('Invalid category');
      }
      return await db.getTreeRepository(Category).findAncestorsTree(m);
    },
  },
  Mutation: {
    addCategory: async (
      _,
      { name, parentId }: GQL.IAddCategoryOnMutationArguments,
      { db, session },
    ) => {
      const { userId, isAdmin } = session;

      if (!userId) {
        throw new AuthenticationError();
      }

      if (!isAdmin) {
        throw new AuthorizationError();
      }

      let parent;
      if (parentId) {
        parent = await db.getRepository(Category).findOne(parentId);
        if (!parent) {
          throw new Error('Invalid parent');
        }
      }

      const c = db.getRepository(Category).create({
        name,
        parent,
      });
      return await c.save();
    },
  },
};
