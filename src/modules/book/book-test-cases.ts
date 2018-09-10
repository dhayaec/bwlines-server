import { bookData } from '../data';

export const addBookInvalidCategory = {
  caseId: 'add book with invalid category',
  query: `mutation{ addBook( title:"${bookData.title}",
                  coverImage:"${bookData.coverImage}",
                  isbn:"${bookData.isbn}",
                  description:"${bookData.description}",
                  rating:${bookData.rating},
                  price:${bookData.price},
                  offerPrice:${bookData.offerPrice},
                  categoryId:"${bookData.categoryId}",
                  publishedYear:${bookData.publishedYear}
              ){ id title slug isbn}
          }`,
  session: {},
};

export const addBookInvalidData = {
  caseId: 'add book with invalid data',
  query: `mutation{ addBook( title:"",
                  coverImage:"${bookData.coverImage}",
                  isbn:"22",
                  description:"${bookData.description}",
                  rating:${bookData.rating},
                  price:${bookData.price},
                  offerPrice:${bookData.offerPrice},
                  categoryId:"${bookData.categoryId}",
                  publishedYear:${bookData.publishedYear}
              ){ id title slug isbn}
          }`,
  session: {},
};

export const addBookValidData = {
  caseId: 'addBookValidData',
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
            title
            isbn
            category{
                name
            }
        }
    }`,
  session: {},
};

export const listBooks = {
  caseId: 'listBooks',
  query: `{
               listBooks(page:1){
                   isbn
                   title
               }
           }`,
  session: {},
};

export const getBook = {
  caseId: 'getBook',
  query: `{
               getBook(id:"${process.env.BOOK_ID}"){
                   title
               }
           }`,
  session: {},
};

export const getBookByCategoryInvalid = {
  caseId: 'getBookByCategory',
  query: `{
             getBookByCategory(categoryId:"${bookData.categoryId}"){
                   title
               }
           }`,
  session: {},
};

export const getBookByCategory = {
  caseId: 'getBookByCategory',
  query: `{
             getBookByCategory(categoryId:"1"){
                   title
               }
           }`,
  session: {},
};
