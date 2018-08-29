import { graphql } from 'graphql';
import { Connection } from 'typeorm';
import { connectDbTest } from '../../utils/connect-db';
import { createDb } from '../../utils/create-db';
import { genSchema } from '../../utils/schema-utils';
import {
  addCategory,
  addCategoryInvalidParent,
  addCategoryWoAdmin,
  addCategoryWoLogin,
  addCategoryWParent,
  getBreadCrumbPath,
  getBreadCrumbPath2,
  getCategoryById,
  getChildCategories,
  getChildCategories2,
  listMainCategories,
} from './category-test-cases';

let connection: Connection;

beforeAll(async () => {
  await createDb();
  connection = await connectDbTest(true);
});

afterAll(async () => connection && connection.close());

describe('category resolver', () => {
  const cases = [
    addCategoryWoLogin,
    addCategoryWoAdmin,
    addCategory,
    addCategoryWParent,
    addCategoryInvalidParent,
    listMainCategories,
    getCategoryById,
    getBreadCrumbPath,
    getBreadCrumbPath2,
    getChildCategories,
    getChildCategories2,
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
