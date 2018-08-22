import { graphql } from 'graphql';
import { Connection } from 'typeorm';
import { genSchema } from '../../utils/schema-utils';
import { connectDbTest } from './../../utils/connect-db';

let connection: Connection;
beforeAll(async () => {
  connection = await connectDbTest(true);
});

afterAll(async () => {
  if (connection) {
    connection.close();
  }
});

describe('cart', () => {
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
  });
});
