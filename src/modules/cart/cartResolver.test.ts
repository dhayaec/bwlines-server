import { graphql } from 'graphql';
import * as ioredis from 'ioredis';
import { Connection } from 'typeorm';
import { createDb } from '../../utils/create-db';
import { genSchema } from '../../utils/schema-utils';
import { connectDbTest } from './../../utils/connect-db';
import { bookData, user } from './../data';

let connection: Connection;
let redis: ioredis.Redis;

const category = 'My Category';

beforeAll(async () => {
  await createDb();
  redis = new ioredis();
  connection = await connectDbTest(true);
});

afterAll(async () => {
  connection.close();
});

const getCartEmpty = {
  caseId: 'getCartEmpty',
  query: `{ getCart{ title } }`,
  session: { userId: '' },
};

const addCategory = {
  caseId: 'addCategory',
  query: `
       mutation {
         addCategory(name:"${category}"){
             id
             name
           }
         }`,
  session: {
    userId: '123',
    isAdmin: true,
  },
};

const addBook = {
  caseId: 'addBook',
  query: `
  mutation{
      addBook(
          title:"${bookData.title}",
          coverImage:"${bookData.coverImage}",
          isbn:"${bookData.isbn}",
          description:"${bookData.description}",
          rating:${bookData.rating},
          price:${bookData.price},
          offerPrice:${bookData.offerPrice},
          categoryId:"1",
          publishedYear:${bookData.publishedYear}
      ){
          id
          title
          isbn
          category{
              name
          }
      }
  }`,
  session: { userId: '' },
};

const registerUserValidData = {
  caseId: 'registerUserValidData',
  query: `mutation {
           register(name:"${user.name}", email: "${user.email}", password: "${
    user.password
  }") { email name id}}`,
  session: { userId: '' },
};

const addToCartQuery = (bookId: string) => `mutation {
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
}
`;

const addToCart = (bid: string, _: any, uid: any) => {
  return {
    caseId: 'addToCart',
    query: addToCartQuery(bid),
    session: { userId: uid },
  };
};

const addToCartAgain = (bid: string, _: any, uid: any) => {
  return {
    caseId: 'addToCartAgain',
    query: addToCartQuery(bid),
    session: { userId: uid },
  };
};

const invalidBookIdQuery = addToCartQuery('123');

const addToCartQueryInvalidBook = (_: string, __: any, uid: any) => {
  return {
    caseId: 'addToCartQueryInvalidBook',
    query: invalidBookIdQuery,
    session: { userId: uid },
  };
};

const addToCartQueryInvalidBookWoLogin = (_: string, __: any, ___: any) => {
  return {
    caseId: 'addToCartQueryInvalidBook',
    query: invalidBookIdQuery,
    session: { userId: '' },
  };
};

const removeFromCart = (bid: string, _: any, uid: any) => {
  return {
    caseId: 'removeFromCart',
    query: `mutation{
               removeFromCart(bookId:"${bid}")
}`,
    session: { userId: uid },
  };
};

const removeWoLogin = {
  caseId: 'removeWoLogin',
  query: `mutation{
             removeFromCart(bookId:"123")
  }`,
  session: { userId: '' },
};

const removeWoLoginInvalidBook = (bid: string, _: any, uid: any) => {
  return {
    caseId: 'removeWoLogin',
    query: `mutation{
             removeFromCart(bookId:"${bid}")
  }`,
    session: { userId: uid },
  };
};

const emptyCartWoLogin = {
  caseId: 'emptyCartWoLogin',
  query: `mutation{emptyCart}`,
  session: { userId: '' },
};

const emptyCartWLogin = (_: string, __: any, uid: any) => {
  return {
    caseId: 'emptyCartWLogin',
    query: `mutation{emptyCart}`,
    session: { userId: uid },
  };
};

const getCart = (_: string, __: any, uid: any) => {
  return {
    caseId: 'getCart',
    query: `{getCart{ title }}`,
    session: { userId: uid },
  };
};

const addToCartLater = (bid: string, _: any, uid: any) => {
  return {
    caseId: 'addToCartLater',
    query: addToCartQuery(bid),
    session: { userId: uid },
  };
};

const emptyCartWLoginLater = (_: string, __: any, uid: any) => {
  return {
    caseId: 'emptyCartWLoginLater',
    query: `mutation{emptyCart}`,
    session: { userId: uid },
  };
};

describe('cart resolver', () => {
  const cases = [
    registerUserValidData,
    getCartEmpty,
    addCategory,
    addBook,
    addToCart,
    addToCartAgain,
    addToCartQueryInvalidBook,
    addToCartQueryInvalidBookWoLogin,
    removeFromCart,
    removeWoLogin,
    removeWoLoginInvalidBook,
    emptyCartWoLogin,
    emptyCartWLogin,
    getCart,
    addToCartLater,
    emptyCartWLoginLater,
  ];
  let bookId = '';
  let cid = '';
  let userId = '';

  cases.forEach(c => {
    const testCase: TestCase =
      typeof c === 'function' ? c(bookId, cid, userId) : c;
    it(`case: ${testCase.caseId}`, async () => {
      const { caseId, query, session } =
        typeof c === 'function' ? c(bookId, cid, userId) : c;
      const ctx = {
        redis,
        session,
        db: connection,
        url: 'http://localhost:4000',
        req: {},
      };
      const result = await graphql(genSchema(), query, null, ctx, {});
      if (caseId === 'addCategory') {
        cid = result.data!.addCategory.id;
        process.env.CATEGORY_ID = cid;
      }
      if (caseId === 'addBook') {
        bookId = result.data!.addBook.id;
        const bookTitle = result.data!.addBook.title;
        expect(bookTitle).toMatchSnapshot();
      } else if (caseId === 'registerUserValidData') {
        userId = result.data!.register.id;
      } else if (caseId === 'addToCart') {
        const cartTitle = result.data!.addToCart.title;
        expect(cartTitle).toMatchSnapshot();
      } else if (caseId === 'addToCartAgain') {
        expect(result.errors).toMatchSnapshot();
      } else if (caseId === 'addToCartLater') {
        expect(result.data!.addToCart.book).toMatchSnapshot();
      } else {
        expect(result).toMatchSnapshot();
      }
    });
  });
});
