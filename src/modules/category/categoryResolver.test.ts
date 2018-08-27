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
  const child = 'Child';
  const childSlug = makeSlug(child);

  const addCategoryTestCase = {
    caseId: 'addCategory',
    query: `mutation { addCategory(name:"${name}"){
        id
        name
        slug
      }}`,
    loggedIn: false,
    isAdmin: false,
    expectation: (result: any) => {
      expect(result.errors![0].message).toEqual('Authentication Failed');
    },
  };

  const addCategoryLoggedInTestCase = {
    caseId: 'logged in but not admin',
    query: `mutation { addCategory(name:"${name}"){
        id
        name
        slug
      }}`,
    loggedIn: true,
    isAdmin: false,
    expectation: (result: any) => {
      expect(result.errors![0].message).toEqual('Authorization Failed');
    },
  };

  const addCategoryLoggedInIsAdminTestCase = {
    caseId: 'logged & admin',
    query: `mutation { addCategory(name:"${name}"){
        id
        name
        slug
      }}`,
    loggedIn: true,
    isAdmin: true,
    expectation: (result: any) => {
      expect(result.errors![0].message).toEqual('Authorization Failed');
    },
  };

  const addCategory2TestCase = {
    caseId: 'addCategory2',
    query: `mutation { addCategory(name:"${child}", parentId:1 ){
        id
        name
        slug
      }}`,
    loggedIn: false,
    isAdmin: false,
    expectation: (result: any) => {
      expect(result.data!.addCategory.name).toEqual(child);
      expect(result.data!.addCategory.slug).toEqual(childSlug);
    },
  };

  const addCategory3TestCase = {
    caseId: 'addCategory3',
    query: `mutation { addCategory(name:"${child}", parentId:0 ){
        id
        name
        slug
      }}`,
    loggedIn: false,
    isAdmin: false,
    expectation: (result: any) => {
      expect(result.errors![0].message).toEqual('Invalid parent');
    },
  };

  const listMainCategoriesTestCase = {
    caseId: 'listMainCategories',
    query: `{ listMainCategories{ slug } }`,
    loggedIn: false,
    isAdmin: false,
    expectation: (result: any) => {
      expect(result).toEqual({
        data: { listMainCategories: [{ slug }] },
      });
    },
  };

  const getCategoryByIdTestCase = {
    caseId: 'getCategoryById',
    query: `{ getCategoryById(id:"1"){ slug } }`,
    loggedIn: false,
    isAdmin: false,
    expectation: (result: any) => {
      expect(result).toEqual({
        data: { getCategoryById: { slug } },
      });
    },
  };

  const getBreadCrumbPathTestCase = {
    caseId: 'getBreadCrumbPath',
    query: `{ getBreadCrumbPath(id:"2"){ slug, parent{
      slug
    } } }`,
    loggedIn: false,
    isAdmin: false,
    expectation: (result: any) => {
      expect(result).toEqual({
        data: {
          getBreadCrumbPath: {
            slug: childSlug,
            parent: {
              slug,
            },
          },
        },
      });
    },
  };

  const getBreadCrumbPath2TestCase = {
    caseId: 'getBreadCrumbPath2',
    query: `{ getBreadCrumbPath(id:"0"){ slug, parent{
      slug
    } } }`,
    loggedIn: false,
    isAdmin: false,
    expectation: (result: any) => {
      expect(result.errors![0].message).toEqual('Invalid category');
    },
  };

  const getChildCategoriesTestCase = {
    caseId: 'getChildCategories',
    query: `{ getChildCategories(id:"1"){ slug children{ slug } } }`,
    loggedIn: false,
    isAdmin: false,
    expectation: (result: any) => {
      expect(result).toEqual({
        data: { getChildCategories: { slug, children: [{ slug: childSlug }] } },
      });
    },
  };

  const getChildCategories2TestCase = {
    caseId: 'getChildCategories2',
    query: `{ getChildCategories(id:"0"){ slug children{ slug } } }`,
    loggedIn: false,
    isAdmin: false,
    expectation: (result: any) => {
      expect(result.errors![0].message).toEqual('Invalid category');
    },
  };

  const cases = [
    addCategoryTestCase,
    addCategoryLoggedInTestCase,
    addCategoryLoggedInIsAdminTestCase,
    addCategory2TestCase,
    addCategory3TestCase,
    listMainCategoriesTestCase,
    getCategoryByIdTestCase,
    getChildCategoriesTestCase,
    getChildCategories2TestCase,
    getBreadCrumbPathTestCase,
    getBreadCrumbPath2TestCase,
  ];

  cases.forEach(c => {
    const { query, expectation, loggedIn, isAdmin } = c;
    it(`case: ${c.caseId}`, async () => {
      let ctx;

      if (!loggedIn) {
        ctx = { db: connection, session: { userId: '', isAdmin: false } };
      } else {
        if (isAdmin) {
          ctx = { db: connection, session: { userId: '123', isAdmin: true } };
        } else {
          ctx = { db: connection, session: { userId: '123', isAdmin: false } };
        }
      }
      console.log(ctx.session, c.caseId);

      const result = await graphql(genSchema(), query, null, ctx, {});
      expectation(result);
    });
  });
});
