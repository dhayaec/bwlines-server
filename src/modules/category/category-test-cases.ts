const name = 'Information Technology';
const child = 'Child';

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
};

export const listMainCategories = {
  caseId: 'listMainCategories',
  query: `{ listMainCategories{ slug } }`,
  session: {},
};

export const getCategoryById = {
  caseId: 'getCategoryById',
  query: `{ getCategoryById(id:"1"){ slug } }`,
  session: {},
};

export const getBreadCrumbPath = {
  caseId: 'getBreadCrumbPath',
  query: `{ getBreadCrumbPath(id:"2"){ slug, parent{
        slug
      } } }`,
  session: {},
};

export const getBreadCrumbPath2 = {
  caseId: 'getBreadCrumbPath2',
  query: `{ getBreadCrumbPath(id:"0"){ slug, parent{
        slug
      } } }`,
  session: {},
};

export const getChildCategories = {
  caseId: 'getChildCategories',
  query: `{ getChildCategories(id:"1"){ slug children{ slug } } }`,
  session: {},
};

export const getChildCategories2 = {
  caseId: 'getChildCategories2',
  query: `{ getChildCategories(id:"0"){ slug children{ slug } } }`,
  session: {},
};
