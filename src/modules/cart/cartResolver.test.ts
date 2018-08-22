import { graphql } from 'graphql';
import * as ioredis from 'ioredis';
import { Connection } from 'typeorm';
import { genSchema } from '../../utils/schema-utils';
import { connectDbTest } from './../../utils/connect-db';
import { bookData } from './../data';

let connection: Connection;
let context: any;
let user: any;
let bookId: any;
let userId: any;
beforeAll(async () => {
  connection = await connectDbTest(true);
  context = {
    db: connection,
    redis: new ioredis(),
  };
  user = {
    name: 'example',
    email: 'example@email.com',
    password: '123456',
  };
});

afterAll(async () => {
  if (connection) {
    connection.close();
  }
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
    expect(errors![0].message).toEqual('Login to view cart');

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
        { db: connection },
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
            datePublished:${bookDataWithCategoryId.datePublished}
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
      expect(errorAgain![0].message).toEqual('Already in cart');

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
      expect(errors![0].message).toEqual('Book not found');

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
      expect(e![0].message).toEqual('Login to add to cart');
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
      expect(errors![0].message).toEqual('Unable to find item in cart');
    });
  });
});
