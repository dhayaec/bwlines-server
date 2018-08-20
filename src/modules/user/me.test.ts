import { Context, Resolver } from './../../typings/graphql-utils';
import { me } from './me';
describe('me', () => {
  it('should return null without login', () => {
    const session = {};
    const db = {};
    const url = '';
    const req = {};
    const meResolver: Resolver = me(
      null,
      null,
      { session, db, url, req, redis: {} } as Context,
      null,
    );
    console.log(meResolver);
  });
});
