import { graphql } from 'graphql';
import * as ioredis from 'ioredis';
import { Connection } from 'typeorm';
import { createDb } from '../../utils/create-db';
import {
  ERROR_ITEM_NOT_FOUND,
  ERROR_LOGIN_TO_CONTINUE,
} from '../../utils/errors';
import { genSchema } from '../../utils/schema-utils';
import { connectDbTest } from './../../utils/connect-db';
import { ERROR_ALREADY_IN_CART, ERROR_EMPTY } from './../../utils/errors';
import { bookData } from './../data';

let connection: Connection;
let context: any;
let user: any;
let bookId: any;
let userId: any;

beforeAll(async () => {
  await createDb();

  connection = await connectDbTest(true);
  context = {
    db: connection,
    redis: new ioredis(),
    url: 'http://localhost:4000',
    session: {},
  };
  user = {
    name: 'example',
    email: 'example@email.com',
    password: '123456',
  };
});

afterAll(async () => {
  connection.close();
});

describe('getCart', () => {
  it('return empty cart', async () => {
    const query = `
      {
          getCart{
              id
              title
          }
      }
      `;
    const result = await graphql(
      genSchema(),
      query,
      null,
      { db: connection, session: { userId: '' } },
      {},
    );
    const { errors } = result;
    expect(errors![0].message).toEqual(ERROR_LOGIN_TO_CONTINUE);

    const loginQuery = `
      mutation {
        register(name:"${user.name}", email: "${user.email}", password: "${
      user.password
    }") {
          email
          name
          id
        }
      }
    `;

    const loginQueryResult = await graphql(
      genSchema(),
      loginQuery,
      null,
      context,
      {},
    );
    expect(loginQueryResult.data!.register.email).toEqual(user.email);

    userId = loginQueryResult.data!.register.id;

    const loggedInQueryResult = await graphql(
      genSchema(),
      query,
      null,
      { db: connection, session: { userId } },
      {},
    );
    const { data } = loggedInQueryResult;
    expect(data).toEqual({ getCart: [] });
  });

  describe('addToCart', () => {
    it('should add to cart', async () => {
      const category = 'Information Technology' + Math.random();
      const addCategoryQuery = `
    mutation {
      addCategory(name:"${category}"){
          id
          name
        }
      }`;

      const { data } = await graphql(
        genSchema(),
        addCategoryQuery,
        null,
        { db: connection, session: { userId: '123', isAdmin: true } },
        {},
      );
      const categoryId = data!.addCategory.id;
      const categoryName = data!.addCategory.name;
      expect(categoryName).toEqual(category);

      const bookDataWithCategoryId = {
        ...bookData,
        categoryId,
      };

      const queryWithCategoryId = `
    mutation{
        addBook(
            title:"${bookDataWithCategoryId.title}",
            coverImage:"${bookDataWithCategoryId.coverImage}",
            isbn:"${bookDataWithCategoryId.isbn}",
            description:"${bookDataWithCategoryId.description}",
            rating:${bookDataWithCategoryId.rating},
            listPrice:${bookDataWithCategoryId.listPrice},
            displayPrice:${bookDataWithCategoryId.displayPrice},
            categoryId:"${bookDataWithCategoryId.categoryId}",
            publishedYear:${bookDataWithCategoryId.publishedYear}
        ){
            id
            title
            isbn
            category{
                name
            }
        }
    }`;

      const resultWithCategoryId = await graphql(
        genSchema(),
        queryWithCategoryId,
        null,
        { db: connection },
        {},
      );

      const { data: savedBook } = resultWithCategoryId;
      bookId = savedBook!.addBook.id;

      const addToCartQuery = `
      mutation {
        addToCart(bookId: "${bookId}") {
          id
          book {
            title
            slug
          }
          user {
            name
            email
          }
          title
        }
      }`;

      const addToCartQueryResult = await graphql(
        genSchema(),
        addToCartQuery,
        null,
        {
          db: connection,
          session: {
            userId,
          },
        },
        {},
      );

      expect(addToCartQueryResult.data!.addToCart!.title).toEqual(
        bookData.title,
      );
      const addToCartQueryInvalidBook = `
      mutation {
        addToCart(bookId: "123") {
          id
          book {
            title
            slug
          }
          user {
            name
            email
          }
          title
        }
      }`;

      const addToCart2QueryResult = await graphql(
        genSchema(),
        addToCartQuery,
        null,
        {
          db: connection,
          session: {
            userId,
          },
        },
        {},
      );

      const { errors: errorAgain } = addToCart2QueryResult;
      expect(errorAgain![0].message).toEqual(ERROR_ALREADY_IN_CART);

      const addToCartQueryInvalidBookResult = await graphql(
        genSchema(),
        addToCartQueryInvalidBook,
        null,
        {
          db: connection,
          session: {
            userId,
          },
        },
        {},
      );

      const { errors } = addToCartQueryInvalidBookResult;
      expect(errors![0].message).toEqual(ERROR_ITEM_NOT_FOUND);

      const addToCartQueryInvalidUserResult = await graphql(
        genSchema(),
        addToCartQueryInvalidBook,
        null,
        {
          db: connection,
          session: {
            userId: '',
          },
        },
        {},
      );
      const { errors: e } = addToCartQueryInvalidUserResult;
      expect(e![0].message).toEqual(ERROR_LOGIN_TO_CONTINUE);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const removeQuery = `
      mutation{
        removeFromCart(bookId:"${bookId}")
        } `;
      const removeQueryResult = await graphql(
        genSchema(),
        removeQuery,
        null,
        {
          db: connection,
          session: {
            userId,
          },
        },
        {},
      );
      expect(removeQueryResult).toEqual({
        data: {
          removeFromCart: true,
        },
      });

      const removeInvalidQuery = `
      mutation{
        removeFromCart(bookId:"123")
      } `;

      const removeInvalidQueryWithoutLoginResult = await graphql(
        genSchema(),
        removeInvalidQuery,
        null,
        {
          db: connection,
          session: {},
        },
        {},
      );

      const { errors: wLErrors } = removeInvalidQueryWithoutLoginResult;
      expect(wLErrors![0].message).toEqual(ERROR_LOGIN_TO_CONTINUE);

      const removeInvalidQueryResult = await graphql(
        genSchema(),
        removeInvalidQuery,
        null,
        {
          db: connection,
          session: {
            userId,
          },
        },
        {},
      );

      const { errors } = removeInvalidQueryResult;
      expect(errors![0].message).toEqual(ERROR_ITEM_NOT_FOUND);
    });
  });

  describe('emptyCart', () => {
    it('should empty cart', async () => {
      const q = `mutation{emptyCart}`;
      const emptyCartResult = await graphql(
        genSchema(),
        q,
        null,
        {
          db: connection,
          session: {},
        },
        {},
      );

      const { errors } = emptyCartResult;
      expect(errors![0].message).toEqual(ERROR_LOGIN_TO_CONTINUE);

      const q1 = `mutation{emptyCart}`;
      const emptyCart1Result = await graphql(
        genSchema(),
        q1,
        null,
        {
          db: connection,
          session: { userId },
        },
        {},
      );

      const { errors: e1 } = emptyCart1Result;
      expect(e1![0].message).toEqual(ERROR_EMPTY);

      const q2 = `mutation{addToCart(bookId:"${bookId}"){
        title
      }}`;
      const addToCart2Result = await graphql(
        genSchema(),
        q2,
        null,
        {
          db: connection,
          session: { userId },
        },
        {},
      );

      const { data } = addToCart2Result;

      expect(data!.addToCart.title).toEqual(bookData.title);

      const q3 = `{getCart{ title }}`;

      const getCart2Result = await graphql(
        genSchema(),
        q3,
        null,
        {
          db: connection,
          session: { userId },
        },
        {},
      );
      expect(getCart2Result.data).toEqual({
        getCart: [{ title: bookData.title }],
      });

      const q4 = `mutation{ emptyCart }`;

      const getCart4Result = await graphql(
        genSchema(),
        q4,
        null,
        {
          db: connection,
          session: { userId },
        },
        {},
      );
      expect(getCart4Result.data).toEqual({
        emptyCart: true,
      });

      const q5 = `{getCart{ title }}`;

      const getCart5Result = await graphql(
        genSchema(),
        q5,
        null,
        {
          db: connection,
          session: { userId },
        },
        {},
      );
      expect(getCart5Result.data).toEqual({
        getCart: [],
      });
    });
  });
});
