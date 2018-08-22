import { graphql } from 'graphql';
import * as ioredis from 'ioredis';
import { Connection } from 'typeorm';
import { genSchema } from '../../utils/schema-utils';
import { connectDbTest } from './../../utils/connect-db';

let connection: Connection;
let context: any;
let user: any;
beforeAll(async () => {
  connection = await connectDbTest(true);
  context = {
    db: connection,
    redis: new ioredis(),
  };
  user = {
    name: 'example',
    email: 'example@email.com',
    password: '123456',
  };
});

afterAll(async () => {
  if (connection) {
    connection.close();
  }
});

describe('getCart', () => {
  it('return empty cart', async () => {
    const query = `
      {
          getCart{
              id
              title
          }
      }
      `;
    const result = await graphql(
      genSchema(),
      query,
      null,
      { db: connection, session: { userId: '' } },
      {},
    );
    const { errors } = result;
    expect(errors![0].message).toEqual('Login to view cart');

    const loginQuery = `
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

    const loginQueryResult = await graphql(
      genSchema(),
      loginQuery,
      null,
      context,
      {},
    );
    expect(loginQueryResult.data!.register.email).toEqual(user.email);

    const userId = loginQueryResult.data!.register.id;

    const loggedInQueryResult = await graphql(
      genSchema(),
      query,
      null,
      { db: connection, session: { userId } },
      {},
    );
    const { data } = loggedInQueryResult;
    expect(data).toEqual({ getCart: [] });
  });
});
