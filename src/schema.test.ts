import { addMockFunctionsToSchema, mockServer } from 'graphql-tools';
import { genSchema } from './utils/schema-utils';

describe('Schema', () => {
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
});
