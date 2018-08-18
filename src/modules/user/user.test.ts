import { graphql } from 'graphql';
import { connectDbTest } from '../../utils/connect-db';
import { createDb } from '../../utils/create-db';
import { genSchema } from '../../utils/schema-utils';

const getUserQuery = async () => {
  return {
    id: 'getUser',
    query: `
    {
        getUser(id: "8aee2bd3-4941-4b70-a7b5-1e20e826cfa6") {
          name
          email
        }
      }`,
    variables: {},
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
