import { AppResolverMap } from 'graphql-utils';
import { Book } from './../../entity/Book';
import { Category } from './../../entity/Category';

export const resolvers: AppResolverMap = {
  Query: {
    listBooks: async (_, __, { db }) => {
      const c = await db.getRepository(Book).find({
        relations: ['category'],
      });
      return c;
    },
  },
  Mutation: {
    addBook: async (
      _,
      {
        title,
        coverImage,
        isbn,
        rating,
        description,
        listPrice,
        displayPrice,
        datePublished,
        categoryId,
      }: GQL.IAddBookOnMutationArguments,
      { db },
    ) => {
      const category = await db.getRepository(Category).findOne(categoryId);

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

      const book = await c.save();
      return book;
    },
  },
};
