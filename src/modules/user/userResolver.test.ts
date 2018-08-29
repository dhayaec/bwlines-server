import { graphql } from 'graphql';
import * as ioredis from 'ioredis';
import { Connection } from 'typeorm';
import { connectDbTest } from '../../utils/connect-db';
import { createDb } from '../../utils/create-db';
import {
  ERROR_INVALID_LOGIN,
  ERROR_LOGIN_TO_CONTINUE,
  ERROR_USER_NOT_FOUND,
  ERROR_VALIDATION_FAILED,
} from '../../utils/errors';
import { genSchema } from '../../utils/schema-utils';
import { user } from '../data';

let connection: Connection;
let registerId: any;
let redis: ioredis.Redis;

beforeAll(async () => {
  await createDb();
  redis = new ioredis();
  connection = await connectDbTest(true);
});

afterAll(async () => {
  connection.close();
});

interface TestCase {
  caseId: string;
  query: string;
  session: { userId: string };
  expectation: (r: any) => void;
}

const registerInvalidData = {
  caseId: 'register with invalid data',
  query: `mutation {
             register(name:"", email: "dummy.com", password: "12") {
               email
               name
               id
} }`,
  session: { userId: '' },
  expectation: (result: any) => {
    const error = result.errors;
    expect(error![0].message).toEqual(ERROR_VALIDATION_FAILED);
  },
};

const registerAdminValidData = {
  caseId: 'register admin with valid data w/o login',
  query: `mutation {
             register(name:"admin user", email: "dummy@dummy.com", password: "123456", admin:true) {
               email
               name
               id }}`,
  session: { userId: '' },
  expectation: (result: any) => {
    const error = result.errors;
    expect(error![0].message).toEqual(ERROR_LOGIN_TO_CONTINUE);
  },
};

const registerUserValidData = {
  caseId: 'registerUserValidData',
  query: `mutation {
           register(name:"${user.name}", email: "${user.email}", password: "${
    user.password
  }") { email name id }}`,
  session: { userId: '' },
  expectation: (result: any) => {
    registerId = result.data!.register.id;
    expect(result.data!.register.email).toEqual(user.email);
  },
};

const reRegister = {
  caseId: 'reRegister',
  query: `mutation {
             register(name:"${user.name}", email: "${user.email}", password: "${
    user.password
  }") {email name }}`,
  session: { userId: '' },
  expectation: (result: any) => {
    expect(result.errors![0].message).toEqual(
      `${user.email} is already registered with us`,
    );
  },
};

const login = {
  caseId: 'login',
  query: `mutation {
         login( email: "${user.email}", password: "${
    user.password
  }") { email name } }`,
  session: { userId: '' },
  expectation: (result: any) => {
    expect(result).toEqual({
      data: { login: { email: user.email, name: user.name } },
    });
  },
};

const invalidLogin = {
  caseId: 'invalidLogin',
  query: `mutation {
         login( email: "${user.email}", password: "invalid") { email name } }`,
  session: { userId: '' },
  expectation: (result: any) => {
    expect(result.errors![0].message).toEqual(ERROR_INVALID_LOGIN);
  },
};

const invalidUser = {
  caseId: 'invalidUser',
  query: `mutation { login(email: "nonexisting@email.com", password: "123456") { name } }`,
  session: { userId: '' },
  expectation: (result: any) => {
    expect(result.errors![0].message).toEqual(ERROR_USER_NOT_FOUND);
  },
};

const getUser = (id: string): TestCase => {
  return {
    caseId: 'getUser',
    query: `{ getUser(id:"${id}"){ id }}`,
    session: { userId: '' },
    expectation: (result: any) => {
      expect(result).toEqual({
        data: { getUser: { id } },
      });
    },
  };
};

const me = (id: string): TestCase => {
  return {
    caseId: 'me',
    query: `query{ me{ id name } }`,
    session: { userId: id },
    expectation: (result: any) => {
      expect(result).toEqual({
        data: {
          me: { id, name: user.name },
        },
      });
    },
  };
};

const logout = (id: string): TestCase => {
  return {
    caseId: 'logout',
    query: `mutation{ logout }`,
    session: { userId: id },
    expectation: (result: any) => {
      expect(result).toEqual({
        data: { logout: id },
      });
    },
  };
};

const meLoggedOut = {
  caseId: 'meLoggedOut',
  query: `mutation{ logout }`,
  session: { userId: '' },
  expectation: (result: any) => {
    expect(result).toEqual({
      data: {
        logout: '',
      },
    });
  },
};

describe('user resolver', () => {
  const cases = [
    registerInvalidData,
    registerAdminValidData,
    registerUserValidData,
    reRegister,
    login,
    invalidLogin,
    invalidUser,
    getUser,
    me,
    logout,
    meLoggedOut,
  ];

  cases.forEach(c => {
    it(`case:`, async () => {
      const { query, expectation, session } =
        typeof c === 'function' ? c(registerId) : c;

      const context = {
        redis,
        session,
        db: connection,
        url: 'http://localhost:4000',
        req: {},
      };

      const loggedInContext = (userId: any) => {
        return {
          redis,
          db: connection,
          session: {
            userId,
            destroy: () => null,
          },
          url: 'http://localhost:4000',
          req: {
            sessionID: '123',
          },
        };
      };

      const ctx = session.userId ? loggedInContext(session.userId) : context;
      const result = await graphql(genSchema(), query, null, ctx, {});

      if (result.errors && result.errors!.length) {
        console.log(result.errors);
      }

      expectation(result);
    });
  });
});
