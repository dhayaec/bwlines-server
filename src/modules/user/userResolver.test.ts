import { graphql } from 'graphql';
import * as ioredis from 'ioredis';
import { Connection } from 'typeorm';
import { connectDbTest } from '../../utils/connect-db';
import { genSchema } from '../../utils/schema-utils';

let connection: Connection;
beforeAll(async () => {
  connection = await connectDbTest(true);
});

afterAll(async () => connection.close());

describe('login', () => {
  it('non existing login', async () => {
    const query = `
      mutation {
        login(email: "nonexisting@email.com", password: "123456") {
          name
        }
      }
    `;
    const context = {
      db: connection,
      redis: new ioredis(),
    };

    const result = await graphql(genSchema(), query, null, context, {});
    const { errors } = result;
    expect(errors![0].message).toEqual('User does not exists');
  });

  it('register and login', async () => {
    const context = {
      db: connection,
      redis: new ioredis(),
    };

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

    const query = `
      mutation {
        register(name:"example", email: "email@email.com", password: "123456") {
          email
          name
          id
        }
      }
    `;

    const result = await graphql(genSchema(), query, null, context, {});
    expect(result.data!.register.email).toEqual('email@email.com');
    const registerId = result.data!.register.id;
    const reRegister = `
      mutation {
        register(name:"example", email: "email@email.com", password: "123456") {
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

    expect(reRegisterResult.errors!.length).toEqual(1);

    const login = `
    mutation {
      login( email: "email@email.com", password: "123456") {
        email
        name
      }
    }
  `;

    const loggedInContext = {
      db: connection,
      redis: new ioredis(),
      session: {
        userId: registerId,
        destroy: () => null,
      },
      req: {
        sessionID: '123',
      },
    };

    const loginResult = await graphql(
      genSchema(),
      login,
      null,
      loggedInContext,
      {},
    );

    expect(loginResult).toEqual({
      data: { login: { email: 'email@email.com', name: 'example' } },
    });

    const inValidLogin = `
    mutation {
      login( email: "email@email.com", password: "beautiful") {
        email
        name
      }
    }
  `;

    const inValidLoginResult = await graphql(
      genSchema(),
      inValidLogin,
      null,
      loggedInContext,
      {},
    );

    const errors = inValidLoginResult.errors;

    expect(errors![0].message).toEqual('Invalid Email or Password');

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
      loggedInContext,
      {},
    );

    expect(getUserQueryResult).toEqual({
      data: { getUser: { id: registerId } },
    });

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
      loggedInContext,
      {},
    );

    expect(meResult).toEqual({
      data: {
        me: { id: registerId, name: 'example' },
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
      loggedInContext,
      {},
    );

    expect(logoutResult).toEqual({
      data: { logout: registerId },
    });

    const loggedOutContext = {
      ...loggedInContext,
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
