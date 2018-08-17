import { graphql } from 'graphql';
import { addMockFunctionsToSchema, mockServer } from 'graphql-tools';
import { genSchema } from './utils/schema-utils';

const meQueryTest = {
  id: 'me Resolver Test',
  query: `
  query{
    me {
      id
      email
    }
  }`,
  variables: {},
  context: {},
  expected: { data: { me: null } },
};

describe('Schema', () => {
  const cases = [meQueryTest];

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

  test('has valid type definitions', async () => {
    expect(async () => {
      const MockServer = mockServer(genSchema(), {});

      await MockServer.query(`{ __schema { types { name } } }`);
    }).not.toThrow();
  });

  cases.forEach(obj => {
    const { id, query, variables, context: ctx, expected } = obj;

    test(`query: ${id}`, async () => {
      return await expect(
        graphql(genSchema(), query, null, { ctx }, variables)
      ).resolves.toEqual(expected);
    });
  });
});
