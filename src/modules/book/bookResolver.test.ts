import { graphql } from 'graphql';
import { Connection } from 'typeorm';
import { genSchema } from '../../utils/schema-utils';
import { bookData } from '../data';
import { connectDbTest } from './../../utils/connect-db';

let connection: Connection;
let bookId: any;
let bookDataWithCategoryId: any;
let category: any;
let categoryId: any;
let categoryName: any;

beforeAll(async () => {
  connection = await connectDbTest(true);
});

afterAll(async () => {
  connection.close();
});

describe('addBook', () => {
  it('addBook invalid category', async () => {
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
  });

  it('addBook invalid input', async () => {
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
  });

  it('valid category', async () => {
    category = 'Information Technology' + Math.random();
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
    categoryId = data!.addCategory.id;
    categoryName = data!.addCategory.name;
    expect(categoryName).toEqual(category);

    bookDataWithCategoryId = {
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

    expect(resultWithCategoryId.data!.addBook.title).toEqual(
      bookDataWithCategoryId.title,
    );
  });
});

describe('listBooks', () => {
  it('list books', async () => {
    const listBooksQuery = `{
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
            category: { name: category },
            isbn: bookDataWithCategoryId.isbn,
            title: bookData.title,
          },
        ],
      },
    });
  });
});

describe('getBook', () => {
  it('should get book by id', async () => {
    const getBookQuery = `{
        getBook(id:"${bookId}"){
            title
        }
    }`;

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

describe('getBookByCategory', () => {
  it('should throw error if invalid categoryId', async () => {
    const getBookByCategoryQuery = `{
      getBookByCategory(categoryId:"${bookData.categoryId}"){
            title
        }
    }`;

    const getBookByCategoryResult = await graphql(
      genSchema(),
      getBookByCategoryQuery,
      null,
      { db: connection },
      {},
    );

    const { errors } = getBookByCategoryResult;

    expect(errors![0].message).toEqual('Invalid category');
  });

  it('should get books by category', async () => {
    const getBookByCategoryQuery = `{
      getBookByCategory(categoryId:"${categoryId}"){
            title
        }
    }`;

    const getBookByCategoryResult = await graphql(
      genSchema(),
      getBookByCategoryQuery,
      null,
      { db: connection },
      {},
    );

    const { data } = getBookByCategoryResult;

    expect(data!.getBookByCategory[0].title).toEqual(bookData.title);
  });
});
