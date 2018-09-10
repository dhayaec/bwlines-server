import { graphql } from 'graphql';
import { Connection } from 'typeorm';
import { connectDbTest } from '../../utils/connect-db';
import { genSchema } from '../../utils/schema-utils';

let connection: Connection;

beforeAll(async () => {
  connection = await connectDbTest(true);
});

afterAll(async () => {
  connection.close();
});

const listUsers = {
  caseId: 'listUsers',
  query: `{
    listUsers(page: 1) {
      id
      name
      email
      mobile
    }
  }`,
  session: {
    userId: '123',
    isAdmin: true,
  },
};

describe('list-users', () => {
  const cases = [listUsers];
  cases.forEach(c => {
    const { query, session } = c;
    it(`case: ${c.caseId}`, async () => {
      const ctx = { session, db: connection };
      const result = await graphql(genSchema(), query, null, ctx, {});
      expect(result).toMatchSnapshot();
    });
  });
});
