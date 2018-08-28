import {
  ERROR_INVALID_CATEGORY,
  ERROR_VALIDATION_FAILED,
} from '../../utils/errors';
import { bookData } from '../data';

export const addBookInvalidCategory = {
  caseId: 'add book with invalid category',
  query: `mutation{ addBook( title:"${bookData.title}",
                  coverImage:"${bookData.coverImage}",
                  isbn:"${bookData.isbn}",
                  description:"${bookData.description}",
                  rating:${bookData.rating},
                  listPrice:${bookData.listPrice},
                  displayPrice:${bookData.displayPrice},
                  categoryId:"${bookData.categoryId}",
                  datePublished:${bookData.datePublished}
              ){ id title slug isbn}
          }`,
  session: {},
  expectation: (result: any) => {
    const { errors } = result;
    expect(errors![0].message).toEqual(ERROR_INVALID_CATEGORY);
  },
};

export const addBookInvalidData = {
  caseId: 'add book with invalid data',
  query: `mutation{ addBook( title:"",
                  coverImage:"${bookData.coverImage}",
                  isbn:"22",
                  description:"${bookData.description}",
                  rating:${bookData.rating},
                  listPrice:${bookData.listPrice},
                  displayPrice:${bookData.displayPrice},
                  categoryId:"${bookData.categoryId}",
                  datePublished:${bookData.datePublished}
              ){ id title slug isbn}
          }`,
  session: {},
  expectation: (result: any) => {
    const { errors } = result;
    expect(errors![0].message).toEqual(ERROR_VALIDATION_FAILED);
  },
};
export const addBookValidData = {
  caseId: 'add book with valid data',
  query: `
    mutation{
        addBook(
            title:"${bookData.title}",
            coverImage:"${bookData.coverImage}",
            isbn:"${bookData.isbn}",
            description:"${bookData.description}",
            rating:${bookData.rating},
            listPrice:${bookData.listPrice},
            displayPrice:${bookData.displayPrice},
            categoryId:"1",
            datePublished:${bookData.datePublished}
        ){
            id
            title
            isbn
            category{
                name
            }
        }
    }`,
  session: {},
  expectation: (result: any) => {
    const { data } = result;
    process.env.BOOK_ID = data.addBook.id;
    expect(data.addBook.title).toEqual(bookData.title);
  },
};

export const listBooks = {
  caseId: 'listBooks',
  query: `{
               listBooks{
                   id
                   isbn
                   title
               }
           }`,
  session: {},
  expectation: (result: any) => {
    process.env.BOOK_ID = result.data.listBooks[0].id;
    expect(result.data.listBooks[0].title).toEqual(bookData.title);
  },
};

export const getBook = {
  caseId: 'getBook',
  query: `{
               getBook(id:"${process.env.BOOK_ID}"){
                   title
               }
           }`,
  session: {},
  expectation: (result: any) => {
    expect(result.data!.getBook).toEqual(null);
  },
};

export const getBookByCategoryInvalid = {
  caseId: 'getBookByCategory',
  query: `{
             getBookByCategory(categoryId:"${bookData.categoryId}"){
                   title
               }
           }`,
  session: {},
  expectation: (result: any) => {
    const { errors } = result;
    expect(errors![0].message).toEqual(ERROR_INVALID_CATEGORY);
  },
};

export const getBookByCategory = {
  caseId: 'getBookByCategory',
  query: `{
             getBookByCategory(categoryId:"1"){
                   title
               }
           }`,
  session: {},
  expectation: (result: any) => {
    const { data } = result;
    expect(data!.getBookByCategory[0].title).toEqual(bookData.title);
  },
};
