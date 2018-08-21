import { graphql } from 'graphql';
import { Connection } from 'typeorm';
import { connectDbTest } from '../../utils/connect-db';
import { genSchema } from '../../utils/schema-utils';
import { makeSlug } from './../../utils/utils';

let connection: Connection;
beforeAll(async () => {
  connection = await connectDbTest(true);
});

afterAll(async () => connection && connection.close());

describe('category resolver', () => {
  it('addCategory', async () => {
    const name = 'Information Technology';
    const slug = makeSlug(name);
    const query = `
    mutation {
      addCategory(name:"${name}"){
          id
          name
          slug
        }
      }`;
    const result = await graphql(
      genSchema(),
      query,
      null,
      { db: connection },
      {},
    );
    expect(result.data!.addCategory.name).toEqual(name);
    expect(result.data!.addCategory.slug).toEqual(slug);

    const queryList = `
    {
      listCategories{
        slug
      }
    }
    `;
    const resultList = await graphql(
      genSchema(),
      queryList,
      null,
      { db: connection },
      {},
    );

    expect(resultList).toEqual({
      data: { listCategories: [{ slug: 'information-technology' }] },
    });
  });
});
