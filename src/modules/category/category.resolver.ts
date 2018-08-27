import { ERROR_INVALID_CATEGORY } from '../../utils/errors';
import { checkAdminRights } from '../../utils/utils';
import { Category } from './../../entity/Category';
import { AppResolverMap } from './../../typings/app-utility-types';

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
        throw new Error(ERROR_INVALID_CATEGORY);
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
        throw new Error(ERROR_INVALID_CATEGORY);
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
      checkAdminRights(session);

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
