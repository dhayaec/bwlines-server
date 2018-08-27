import { graphql } from 'graphql';
import { Connection } from 'typeorm';
import { connectDbTest } from '../../utils/connect-db';
import { createDb } from '../../utils/create-db';
import { genSchema } from '../../utils/schema-utils';
import { makeSlug } from './../../utils/utils';

let connection: Connection;

beforeAll(async () => {
  await createDb();
  connection = await connectDbTest(true);
});

afterAll(async () => connection && connection.close());

describe('category resolver', () => {
  const name = 'Information Technology ' + Math.random();
  const slug = makeSlug(name);

  const addCategoryTestCase = {
    caseId: 'addCategory',
    query: `mutation { addCategory(name:"${name}"){
        id
        name
        slug
      }}`,
    expectation: (result: any) => {
      expect(result.data!.addCategory.name).toEqual(name);
      expect(result.data!.addCategory.slug).toEqual(slug);
    },
  };

  const listMainCategoriesTestCase = {
    caseId: 'listMainCategories',
    query: `{ listMainCategories{ slug } }`,
    expectation: (result: any) => {
      expect(result).toEqual({
        data: { listMainCategories: [{ slug }] },
      });
    },
  };

  const cases = [addCategoryTestCase, listMainCategoriesTestCase];

  cases.forEach(c => {
    const { query, expectation } = c;
    it(`case: ${c.caseId}`, async () => {
      const ctx = { db: connection };
      const result = await graphql(genSchema(), query, null, ctx, {});
      expectation(result);
    });
  });
});
