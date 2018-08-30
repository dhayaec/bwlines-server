import { bookSchema } from '../../entity/bookSchema';
import { ERROR_INVALID_CATEGORY } from '../../utils/errors';
import { ITEMS_PER_PAGE } from './../../constants';
import { Book } from './../../entity/Book';
import { Category } from './../../entity/Category';
import { AppResolverMap } from './../../typings/app-utility-types';
import { validateInputs } from './../../utils/utils';

export const resolvers: AppResolverMap = {
  Query: {
    listBooks: async (_, { page }: GQL.IListBooksOnQueryArguments, { db }) => {
      const skip = page && page > 0 ? (page - 1) * ITEMS_PER_PAGE : 0;

      return await db.getRepository(Book).find({
        skip,
        take: ITEMS_PER_PAGE,
        relations: ['category'],
      });
    },
    getBook: async (_, { id }: GQL.IGetBookOnQueryArguments, { db }) => {
      return await db
        .getRepository(Book)
        .findOne(id, { relations: ['category'] });
    },
    getBookByCategory: async (
      _,
      { categoryId }: GQL.IGetBookByCategoryOnQueryArguments,
      { db },
    ) => {
      const category = await db.getRepository(Category).findOne(categoryId);
      if (!category) {
        throw new Error(ERROR_INVALID_CATEGORY);
      }

      return await db
        .getRepository(Book)
        .find({ where: { category }, relations: ['category'] });
    },
  },
  Mutation: {
    addBook: async (_, args: GQL.IAddBookOnMutationArguments, { db }) => {
      await validateInputs(bookSchema, args);

      const {
        title,
        coverImage,
        isbn,
        rating,
        description,
        price,
        offerPrice,
        publishedYear,
        categoryId,
      } = args;

      const category = await db.getRepository(Category).findOne(categoryId);

      if (!category) {
        throw new Error(ERROR_INVALID_CATEGORY);
      }

      const c = db.getRepository(Book).create({
        title,
        coverImage,
        isbn,
        rating,
        description,
        price,
        offerPrice,
        publishedYear,
        category,
      });

      return await c.save();
    },
  },
};
