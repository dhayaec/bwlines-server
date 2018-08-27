import {
  ERROR_INVALID_CATEGORY,
  InputValidationError,
} from '../../utils/errors';
import { formatYupError } from '../../utils/utils';
import { bookSchema } from '../validation-rules';
import { Book } from './../../entity/Book';
import { Category } from './../../entity/Category';
import { AppResolverMap } from './../../typings/app-utility-types';

export const resolvers: AppResolverMap = {
  Query: {
    listBooks: async (_, __, { db }) => {
      return await db.getRepository(Book).find({
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
      const values = {
        ...args,
        datePublished: new Date(args.datePublished),
      };

      try {
        await bookSchema.validate(values, { abortEarly: false });
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
        datePublished,
        categoryId,
      } = values;

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
        datePublished,
        category,
      });

      return await c.save();
    },
  },
};
