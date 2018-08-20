import { graphql } from 'graphql';
import { connectDbTest } from '../../utils/connect-db';
import { createDb } from '../../utils/create-db';
import { genSchema } from '../../utils/schema-utils';

const getUserQuery = async () => {
  return {
    id: 'getUser',
    query: `
    query($id: ID!){
      getUser(id: $id) {
        name
        email
      }
    }`,
    variables: {
      id: '123',
    },
    context: {
      db: await connectDbTest(),
    },
    expected: { data: { getUser: null } },
  };
};

beforeAll(() => createDb());

describe('Schema', () => {
  const cases = [getUserQuery];

  cases.forEach(async obj => {
    test(`query`, async () => {
      const { query, variables, context: ctx, expected } = await obj();
      return await expect(
        graphql(genSchema(), query, null, { ctx }, variables),
      ).resolves.toEqual(expected);
    });
  });
});
