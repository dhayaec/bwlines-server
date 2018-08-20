import { graphql } from 'graphql';
import { addMockFunctionsToSchema } from 'graphql-tools';
import * as ioredis from 'ioredis';
import { Connection } from 'typeorm';
import { genSchema } from '../../utils/schema-utils';
import { connectDbTest } from './../../utils/connect-db';

let connection: Connection;
beforeAll(async () => {
  connection = await connectDbTest(true);
});

afterAll(async () => connection.close());

let registeredId: string;

const me = {
  id: 'me',
  query: `
      query {
        me {
           name
        }
      }
    `,
  variables: {},
  context: {},
  expected: { data: { me: null } },
};

const getUser = {
  id: 'getUser',
  query: `
        query {
          getUser(id:"123") {
             name
          }
        }
      `,
  variables: {},
  context: {},
  expected: { data: { getUser: null } },
};

const register = async () => {
  return {
    id: 'register',
    query: `
        mutation {
          register(name:"example", email: "email@email.com", password: "123456") {
            id
            name
          }
        }
      `,
    variables: {},
    context: {
      db: connection,
    },
    expected: { data: { register: { name: 'example' } } },
  };
};

const loginInvalid = async () => {
  return {
    id: 'login',
    query: `
        mutation {
          login(email: "email@email.com", password: "asd") {
            name
          }
        }
      `,
    variables: {},
    context: {
      db: connection,
    },
    expected: { data: { login: null }, errors: [] },
  };
};

const login = async () => {
  return {
    id: 'login',
    query: `
        mutation {
          login(email: "email@email.com", password: "123456") {
            name
          }
        }
      `,
    variables: {},
    context: {
      db: connection,
    },
    expected: { data: { login: null }, errors: [] },
  };
};

describe('Schema', async () => {
  const cases = [me, getUser];

  cases.forEach(obj => {
    it(`query: `, () => {
      const { query, variables, context: ctx, expected } = obj;
      return expect(
        graphql(genSchema(), query, null, ctx, variables),
      ).resolves.toEqual(expected);
    });
  });

  addMockFunctionsToSchema({
    schema: genSchema(),
    mocks: {
      Boolean: () => false,
      ID: () => '1',
      Int: () => 1,
      Float: () => 12.34,
      String: () => 'Dog',
    },
  });

  it('register', async () => {
    const { query, variables, context: ctx } = await register();
    const result = await graphql(genSchema(), query, null, ctx, variables);
    expect(result.data!.register.name).toEqual('example');
    registeredId = result.data!.register.id;
    expect(result.data!.register.id).not.toEqual('');
  });

  it('loginInvalid', async () => {
    const { query, variables, context: ctx } = await loginInvalid();
    const result = await graphql(genSchema(), query, null, ctx, variables);
    expect(result.data).toEqual({ login: null });
    expect(result.errors!.length).toEqual(1);
  });

  it('login', async () => {
    const { query, variables, context: ctx } = await login();
    const result = await graphql(genSchema(), query, null, ctx, variables);
    expect(result.data).toEqual({ login: null });
    expect(result.errors!.length).toEqual(1);

    const q = `
    mutation {
      logout
    }
  `;
    const contextLoggedIn = {
      db: connection,
      session: {
        userId: registeredId,
        destroy: () => null,
      },
      redis: new ioredis(),
    };

    const logoutResult = await graphql(
      genSchema(),
      q,
      null,
      contextLoggedIn,
      variables,
    );
    expect(logoutResult.data!.logout).toEqual(registeredId);
  });

  it('getUser', async () => {
    const getUserById = () => {
      return {
        id: 'getUserById',
        query: `
        query {
            getUser(id:"${registeredId}") {
              name
              email
            }
        }
                  `,
        variables: {},
        context: {
          db: connection,
        },
        expected: { data: { getUser: null } },
      };
    };

    const { query, variables, context: ctx } = await getUserById();
    const result = await graphql(genSchema(), query, null, ctx, variables);
    expect(result.data).toEqual({
      getUser: { email: 'email@email.com', name: 'example' },
    });
  });
});
