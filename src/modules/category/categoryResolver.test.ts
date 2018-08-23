import { graphql } from 'graphql';
import { Connection } from 'typeorm';
import { connectDbTest } from '../../utils/connect-db';
import { createDb } from '../../utils/create-db';
import { genSchema } from '../../utils/schema-utils';
import { makeSlug } from './../../utils/utils';

let connection: Connection;
let name: any;
let slug: any;

beforeAll(async () => {
  await createDb();

  connection = await connectDbTest(true);
  name = 'Information Technology ' + Math.random();
  slug = makeSlug(name);
});

afterAll(async () => connection && connection.close());

describe('category resolver', () => {
  it('addCategory', async () => {
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
  });

  it('listCategory', async () => {
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
      data: { listCategories: [{ slug }] },
    });
  });
});
