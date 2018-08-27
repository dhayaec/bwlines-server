import { User } from '../../entity/User';
import { Book } from './../../entity/Book';
import { Cart } from './../../entity/Cart';
import { AppResolverMap } from './../../typings/app-utility-types';
import { AuthenticationError } from './../../utils/errors';

export const resolvers: AppResolverMap = {
  Query: {
    getCart: async (_, __, { db, session }) => {
      const { userId } = session;

      if (!userId) {
        throw new AuthenticationError();
      }
      const user = await db.getRepository(User).findOne(userId);

      return await db
        .getRepository(Cart)
        .find({ where: { user }, relations: ['book', 'user'] });
    },
  },
  Mutation: {
    addToCart: async (
      _,
      { bookId, quantity }: GQL.IAddToCartOnMutationArguments,
      { db, session },
    ) => {
      const { userId } = session;

      if (!userId) {
        throw new AuthenticationError();
      }

      const book = await db.getRepository(Book).findOne(bookId);
      const user = await db.getRepository(User).findOne(userId);
      if (!book) {
        throw new Error('Book not found');
      }

      const cartRepository = db.getRepository(Cart);

      const cart = await cartRepository.findOne({
        where: {
          book,
          user,
        },
      });

      if (cart) {
        throw new Error('Already in cart');
      }

      const c = cartRepository.create({
        book,
        user,
        title: book.title,
        quantity: quantity || 1,
      });

      return await c.save();
    },
    removeFromCart: async (
      _,
      { bookId }: GQL.IRemoveFromCartOnMutationArguments,
      { db, session },
    ) => {
      const { userId } = session;
      if (!userId) {
        throw new AuthenticationError();
      }

      const book = await db.getRepository(Book).findOne(bookId);
      if (!book) {
        throw new Error('Book not found');
      }

      const user = await db.getRepository(User).findOne(userId);

      const cart = await db.getRepository(Cart).findOne({
        where: {
          book,
          user,
        },
      });

      if (!cart) {
        throw new Error('Unable to find item in cart');
      }

      return await db.getRepository(Cart).delete(cart.id);
    },
    emptyCart: async (_, __, { db, session }) => {
      const { userId } = session;

      if (!userId) {
        throw new AuthenticationError();
      }

      const user = await db.getRepository(User).findOne(userId);

      const cart = await db.getRepository(Cart).find({
        where: {
          user,
        },
      });

      if (!cart.length) {
        throw new Error('Nothing in cart');
      }

      const ids = cart.map(x => x.id);
      return await db.getRepository(Cart).delete(ids);
    },
  },
};
