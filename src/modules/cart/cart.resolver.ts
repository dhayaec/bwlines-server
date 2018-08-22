import { AppResolverMap } from 'graphql-utils';
import { User } from '../../entity/User';
import { Book } from './../../entity/Book';
import { Cart } from './../../entity/Cart';

export const resolvers: AppResolverMap = {
  Query: {
    getCart: async (_, __, { db, session }) => {
      const { userId } = session;

      if (!userId) {
        throw new Error('Login to view cart');
      }
      const user = await db.getRepository(User).findOne(userId);

      const cartData = await db
        .getRepository(Cart)
        .find({ where: { user }, relations: ['book', 'user'] });
      return cartData;
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
        throw new Error('Login to add to cart');
      }

      const book = await db.getRepository(Book).findOne(bookId);
      const user = await db.getRepository(User).findOne(userId);
      if (!book) {
        throw new Error('Book not found');
      }

      if (!user) {
        throw new Error('User not found');
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

      const cartItem = await c.save();
      return cartItem;
    },
    removeFromCart: async (
      _,
      { bookId }: GQL.IRemoveFromCartOnMutationArguments,
      { db, session },
    ) => {
      const { userId } = session;
      const cart = await db.getRepository(Cart).findOne({
        where: {
          bookId,
          userId,
        },
      });

      if (!cart) {
        throw new Error('Unable to find item in cart');
      }

      await db.getRepository(Cart).delete(cart.id);

      return true;
    },
  },
};
