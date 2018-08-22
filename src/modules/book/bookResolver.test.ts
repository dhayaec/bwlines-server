import { graphql } from 'graphql';
import { Connection } from 'typeorm';
import { genSchema } from '../../utils/schema-utils';
import { connectDbTest } from './../../utils/connect-db';

let connection: Connection;
beforeAll(async () => {
  connection = await connectDbTest(true);
});

afterAll(async () => {
  if (connection) {
    connection.close();
  }
});

describe('book reducer', () => {
  it('addBook', async () => {
    const bookData = {
      title: 'IT book 3',
      coverImage: 'adfsd.jpg',
      isbn: '1233434234',
      description:
        'This is sddescription sdfs dfsdf sdfsdfsdfsdfsdfsdfsdfsf' +
        'sdfsd fsdfds fsdfsd fsdf  sdfsdf sdfsdf sdfds fsdfsdfs sdfsdfsdfsdfsdfsdfsdfsdfd fsdfsd',
      rating: 0,
      listPrice: 66.0,
      displayPrice: 56.0,
      categoryId: 'invalid',
      datePublished: 1534851948491,
    };

    const query = `
    mutation{
        addBook(
            title:"${bookData.title}",
            coverImage:"${bookData.coverImage}",
            isbn:"${bookData.isbn}",
            description:"${bookData.description}",
            rating:${bookData.rating},
            listPrice:${bookData.listPrice},
            displayPrice:${bookData.displayPrice},
            categoryId:"${bookData.categoryId}",
            datePublished:${bookData.datePublished}
        ){
            id
            title
            slug
            isbn
        }
    }`;

    const result = await graphql(
      genSchema(),
      query,
      null,
      { db: connection },
      {},
    );

    const { errors } = result;
    expect(errors![0].message).toEqual('Category does not exists');

    const validationFailQuery = `
    mutation{
        addBook(
            title:"",
            coverImage:"${bookData.coverImage}",
            isbn:"0",
            description:"${bookData.description}",
            rating:${bookData.rating},
            listPrice:${bookData.listPrice},
            displayPrice:${bookData.displayPrice},
            categoryId:"${bookData.categoryId}",
            datePublished:${bookData.datePublished}
        ){
            id
            title
            slug
            isbn
        }
    }`;

    const validationFailQueryResult = await graphql(
      genSchema(),
      validationFailQuery,
      null,
      { db: connection },
      {},
    );
    const { errors: validationFAil } = validationFailQueryResult;
    expect(validationFAil![0].message).toEqual('Validation failed');

    const name = 'Information Technology' + Math.random();
    const addCategoryQuery = `
    mutation {
      addCategory(name:"${name}"){
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
    expect(categoryName).toEqual(name);

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
    const bookId = savedBook!.addBook.id;

    expect(resultWithCategoryId.data!.addBook.title).toEqual(
      bookDataWithCategoryId.title,
    );

    const listBooksQuery = `
    {
        listBooks{
            id
            isbn
            title
            category{
                name
            }
        }
    }`;

    const resultListBooks = await graphql(
      genSchema(),
      listBooksQuery,
      null,
      { db: connection },
      {},
    );

    expect(resultListBooks).toEqual({
      data: {
        listBooks: [
          {
            id: bookId,
            category: { name },
            isbn: bookDataWithCategoryId.isbn,
            title: bookData.title,
          },
        ],
      },
    });

    const getBookQuery = `
    {
        getBook(id:"${bookId}"){
            title
        }
    }
    `;

    const getBookResult = await graphql(
      genSchema(),
      getBookQuery,
      null,
      { db: connection },
      {},
    );

    expect(getBookResult.data!.getBook.title).toEqual(bookData.title);
  });
});
