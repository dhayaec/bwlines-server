import {
  ERROR_INVALID_CATEGORY,
  InputValidationError,
} from '../../utils/errors';
import { formatYupError } from '../../utils/utils';
import { bookSchema } from '../validation-rules';
import { ITEMS_PER_PAGE } from './../../constants';
import { Book } from './../../entity/Book';
import { Category } from './../../entity/Category';
import { AppResolverMap } from './../../typings/app-utility-types';

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
      try {
        await bookSchema.validate(args, { abortEarly: false });
      } catch (err) {
        const errors = formatYupError(err);

        throw new InputValidationError({
          data: errors,
        });
      }

      const {
        title,
        coverImage,
        isbn,
        rating,
        description,
        listPrice,
        displayPrice,
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
        listPrice,
        displayPrice,
        publishedYear,
        category,
      });

      return await c.save();
    },
  },
};
