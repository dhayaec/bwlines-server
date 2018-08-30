import {
  ERROR_INVALID_CATEGORY,
  ERROR_LOGIN_TO_CONTINUE,
  ERROR_PERMISSION_DENIED,
} from '../../utils/errors';
import { makeSlug } from '../../utils/utils';

const name = 'Information Technology ' + Math.random();
const slug = makeSlug(name);
const child = 'Child';
const childSlug = makeSlug(child);

export const addCategoryWoLogin = {
  caseId: 'add category without login',
  query: `mutation { addCategory(name:"${name}"){
          id
          name
          slug
        }}`,
  session: {
    userId: '',
    isAdmin: false,
  },
  expectation: (result: any) => {
    expect(result.errors![0].message).toEqual(ERROR_LOGIN_TO_CONTINUE);
  },
};

export const addCategoryWoAdmin = {
  caseId: 'logged in but not admin',
  query: `mutation { addCategory(name:"${name}"){
          id
          name
          slug
        }}`,
  session: {
    userId: '123456',
    isAdmin: false,
  },
  expectation: (result: any) => {
    expect(result.errors![0].message).toEqual(ERROR_PERMISSION_DENIED);
  },
};

export const addCategoryValid = {
  caseId: 'addCategoryValid',
  query: `mutation { addCategory(name:"${name}"){
          id
          name
          slug
        }}`,
  session: {
    userId: '123456',
    isAdmin: true,
  },
  expectation: (result: any) => {
    expect(result.data.addCategory.name).toEqual(name);
  },
};

export const addCategoryWParent = {
  caseId: 'add category with parent',
  query: `mutation { addCategory(name:"${child}", parentId:1 ){
          id
          name
          slug
        }}`,
  session: {
    userId: '123456',
    isAdmin: true,
  },
  expectation: (result: any) => {
    expect(result.data!.addCategory.name).toEqual(child);
    expect(result.data!.addCategory.slug).toEqual(childSlug);
  },
};

export const addCategoryInvalidParent = {
  caseId: 'add category with invalid parent',
  query: `mutation { addCategory(name:"${child}", parentId:0 ){
          id
          name
          slug
        }}`,
  session: {
    userId: '123456',
    isAdmin: true,
  },
  expectation: (result: any) => {
    expect(result.errors![0].message).toEqual('Invalid parent');
  },
};

export const listMainCategories = {
  caseId: 'listMainCategories',
  query: `{ listMainCategories{ slug } }`,
  session: {},
  expectation: (result: any) => {
    expect(result).toEqual({
      data: { listMainCategories: [{ slug }] },
    });
  },
};

export const getCategoryById = {
  caseId: 'getCategoryById',
  query: `{ getCategoryById(id:"1"){ slug } }`,
  session: {},
  expectation: (result: any) => {
    expect(result).toEqual({
      data: { getCategoryById: { slug } },
    });
  },
};

export const getBreadCrumbPath = {
  caseId: 'getBreadCrumbPath',
  query: `{ getBreadCrumbPath(id:"2"){ slug, parent{
        slug
      } } }`,
  session: {},
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

export const getBreadCrumbPath2 = {
  caseId: 'getBreadCrumbPath2',
  query: `{ getBreadCrumbPath(id:"0"){ slug, parent{
        slug
      } } }`,
  session: {},
  expectation: (result: any) => {
    expect(result.errors![0].message).toEqual(ERROR_INVALID_CATEGORY);
  },
};

export const getChildCategories = {
  caseId: 'getChildCategories',
  query: `{ getChildCategories(id:"1"){ slug children{ slug } } }`,
  session: {},
  expectation: (result: any) => {
    expect(result).toEqual({
      data: { getChildCategories: { slug, children: [{ slug: childSlug }] } },
    });
  },
};

export const getChildCategories2 = {
  caseId: 'getChildCategories2',
  query: `{ getChildCategories(id:"0"){ slug children{ slug } } }`,
  session: {},
  expectation: (result: any) => {
    expect(result.errors![0].message).toEqual(ERROR_INVALID_CATEGORY);
  },
};
