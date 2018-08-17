import { graphql } from "graphql";
import { addMockFunctionsToSchema, mockServer } from "graphql-tools";
import { genSchema } from "./utils/schema-utils";
import { connectDbTest } from "./utils/connect-db";

const meQueryTest = {
  id: "me Resolver Test",
  query: `
  query{
    me {
      id
      email
    }
  }`,
  variables: {},
  context: {},
  expected: { data: { me: null } }
};

const getEmailQueryTest = {
  id: "me Resolver Test",
  query: `
  query{
    getUser(
      id:"2611219f-95a5-423b-bc31-955b4febb1ac"
    ){
      id
      name
    }
  }`,
  variables: {},
  context: {
    db: async () => await connectDbTest()
  },
  expected: { data: { me: null } }
};

describe("Schema", () => {
  const cases = [meQueryTest, getEmailQueryTest];

  addMockFunctionsToSchema({
    schema: genSchema(),
    mocks: {
      Boolean: () => false,
      ID: () => "1",
      Int: () => 1,
      Float: () => 12.34,
      String: () => "Dog"
    }
  });

  test("has valid type definitions", async () => {
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
