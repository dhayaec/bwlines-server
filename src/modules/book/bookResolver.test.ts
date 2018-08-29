import { graphql } from 'graphql';
import { Connection } from 'typeorm';
import { genSchema } from '../../utils/schema-utils';
import {
  addBookInvalidCategory,
  addBookInvalidData,
  addBookValidData,
  getBook,
  getBookByCategory,
  getBookByCategoryInvalid,
  listBooks,
} from './book-test-cases';

import { addCategory } from '../category/category-test-cases';
import { connectDbTest } from './../../utils/connect-db';

let connection: Connection;

beforeAll(async () => {
  connection = await connectDbTest(true);
});

afterAll(async () => {
  connection.close();
});

describe('books resolver', () => {
  const cases = [
    addBookInvalidCategory,
    addBookInvalidData,
    addCategory,
    addBookValidData,
    listBooks,
    getBookByCategoryInvalid,
    getBookByCategory,
    getBook,
  ];
  cases.forEach(c => {
    const { query, expectation, session } = c;
    it(`case: ${c.caseId}`, async () => {
      const ctx = { session, db: connection };
      const result = await graphql(genSchema(), query, null, ctx, {});
      expectation(result);
      if (result.errors && result.errors!.length) {
        console.log(result.errors);
      }
    });
  });
});
