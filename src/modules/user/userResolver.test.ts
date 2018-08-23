import { graphql } from 'graphql';
import * as ioredis from 'ioredis';
import { Connection } from 'typeorm';
import { connectDbTest } from '../../utils/connect-db';
import { genSchema } from '../../utils/schema-utils';
import { user } from '../data';

let connection: Connection;
let context: any;
let loggedInContext: any;
let registerId: any;

beforeAll(async () => {
  connection = await connectDbTest(true);

  context = {
    db: connection,
    redis: new ioredis(),
    url: 'http://localhost:4000',
  };

  loggedInContext = (userId: any) => {
    return {
      db: connection,
      redis: new ioredis(),
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
});

afterAll(async () => {
  if (connection) {
    connection.close();
  }
});

describe('login', () => {
  describe('register', () => {
    it('invalid input', async () => {
      const registerInvalid = `
      mutation {
        register(name:"", email: "dummy.com", password: "12") {
          email
          name
          id
        }
      }
    `;
      const registerInvalidResult = await graphql(
        genSchema(),
        registerInvalid,
        null,
        context,
        {},
      );
      const error = registerInvalidResult.errors;
      expect(error![0].message).toEqual('Validation failed');
    });

    it('register with valid detail and login', async () => {
      const query = `
      mutation {
        register(name:"${user.name}", email: "${user.email}", password: "${
        user.password
      }") {
          email
          name
          id
        }
      }
    `;

      const result = await graphql(genSchema(), query, null, context, {});
      expect(result.data!.register.email).toEqual(user.email);

      registerId = result.data!.register.id;

      const reRegister = `
      mutation {
        register(name:"${user.name}", email: "${user.email}", password: "${
        user.password
      }") {
          email
          name
        }
      }
    `;
      const reRegisterResult = await graphql(
        genSchema(),
        reRegister,
        null,
        context,
        {},
      );

      const { errors: err } = reRegisterResult;

      expect(err![0].message).toEqual(
        `${user.email} is already registered with us`,
      );

      const login = `
    mutation {
      login( email: "${user.email}", password: "${user.password}") {
        email
        name
      }
    }`;
      const loginResult = await graphql(
        genSchema(),
        login,
        null,
        loggedInContext(registerId),
        {},
      );

      expect(loginResult).toEqual({
        data: { login: { email: user.email, name: user.name } },
      });
    });
  });

  describe('login', () => {
    it('invalid login', async () => {
      const inValidLogin = `
    mutation {
      login( email: "${user.email}", password: "beautiful") {
        email
        name
      }
    }
  `;

      const inValidLoginResult = await graphql(
        genSchema(),
        inValidLogin,
        null,
        loggedInContext(registerId),
        {},
      );

      const errors = inValidLoginResult.errors;

      expect(errors![0].message).toEqual('Invalid Email or Password');

      const queryNonExisting = `
      mutation {
        login(email: "nonexisting@email.com", password: "123456") {
          name
        }
      }
    `;

      const nonExisting = await graphql(
        genSchema(),
        queryNonExisting,
        null,
        context,
        {},
      );
      const { errors: nonExistingError } = nonExisting;
      expect(nonExistingError![0].message).toEqual('User does not exists');
    });
  });

  describe('getUser', () => {
    it('get user by id', async () => {
      const getUserQuery = `
      {
        getUser(id:"${registerId}"){
          id
        }
      }
      `;

      const getUserQueryResult = await graphql(
        genSchema(),
        getUserQuery,
        null,
        loggedInContext(registerId),
        {},
      );

      expect(getUserQueryResult).toEqual({
        data: { getUser: { id: registerId } },
      });
    });
  });

  describe('me', () => {
    it('get logged in me', async () => {
      const meQuery = `
      query{
          me{
              id
              name
          }
      }
      `;

      const meResult = await graphql(
        genSchema(),
        meQuery,
        null,
        loggedInContext(registerId),
        {},
      );

      expect(meResult).toEqual({
        data: {
          me: { id: registerId, name: user.name },
        },
      });

      const logoutQuery = `
      mutation{
          logout
      }
      `;
      const logoutResult = await graphql(
        genSchema(),
        logoutQuery,
        null,
        loggedInContext(registerId),
        {},
      );

      expect(logoutResult).toEqual({
        data: { logout: registerId },
      });

      const loggedOutContext = {
        ...loggedInContext(registerId),
        session: {
          userId: null,
        },
      };

      const meQueryNow = await graphql(
        genSchema(),
        meQuery,
        null,
        loggedOutContext,
        {},
      );

      expect(meQueryNow).toEqual({ data: { me: null } });
    });
  });
});
