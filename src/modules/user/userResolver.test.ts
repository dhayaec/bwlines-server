import { graphql } from 'graphql';
import * as ioredis from 'ioredis';
import { Connection } from 'typeorm';
import { connectDbTest } from '../../utils/connect-db';
import { createDb } from '../../utils/create-db';
import { genSchema } from '../../utils/schema-utils';
import { user } from '../data';

let connection: Connection;
let registerId: any = '';
let redis: ioredis.Redis;

beforeAll(async () => {
  await createDb();
  redis = new ioredis();
  connection = await connectDbTest(true);
});

afterAll(async () => {
  connection.close();
});

const registerInvalidData = {
  caseId: 'register with invalid data',
  query: `mutation {
             register(name:"", email: "dummy.com", password: "12") {
               email
               name
               id
} }`,
  session: { userId: '' },
};

const registerAdminValidData = {
  caseId: 'register admin with valid data w/o login',
  query: `mutation {
             register(name:"admin user", email: "dummy@dummy.com", password: "123456", admin:true) {
               email
               name
               id }}`,
  session: { userId: '' },
};

const registerUserValidData = {
  caseId: 'registerUserValidData',
  query: `mutation {
           register(name:"${user.name}", email: "${user.email}", password: "${
    user.password
  }") { email name id}}`,
  session: { userId: '' },
};

const reRegister = {
  caseId: 'reRegister',
  query: `mutation {
             register(name:"${user.name}", email: "${user.email}", password: "${
    user.password
  }") {email name }}`,
  session: { userId: '' },
};

const login = {
  caseId: 'login',
  query: `mutation {
         login( email: "${user.email}", password: "${
    user.password
  }") { email name } }`,
  session: { userId: '' },
};

const invalidLogin = {
  caseId: 'invalidLogin',
  query: `mutation {
         login( email: "${user.email}", password: "invalid") { email name } }`,
  session: { userId: '' },
};

const invalidUser = {
  caseId: 'invalidUser',
  query: `mutation { login(email: "nonexisting@email.com", password: "123456") { name } }`,
  session: { userId: '' },
};

const getUser = {
  caseId: 'getUser',
  query: `{ getUser(id:"123"){ id }}`,
  session: { userId: '' },
};

const me = (id: string): TestCase => {
  return {
    caseId: 'me',
    query: `query{ me{ name } }`,
    session: { userId: id },
  };
};

const logout = (id: string): TestCase => {
  return {
    caseId: 'logout',
    query: `mutation{ logout }`,
    session: { userId: id },
  };
};

const meLoggedOut = {
  caseId: 'meLoggedOut',
  query: `mutation{ logout }`,
  session: { userId: '' },
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
      const { query, session, caseId } =
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
      const result: any = await graphql(genSchema(), query, null, ctx, {});

      if (caseId === 'registerUserValidData') {
        const { data } = result;
        registerId = data.register!.id;
        expect(data.register!.name).toEqual(user.name);
      } else {
        expect(result).toMatchSnapshot();
      }
    });
  });
});
