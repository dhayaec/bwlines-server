import { User } from '../../entity/User';
import { Resolver } from './../../typings/graphql-utils';

export const getUser: Resolver = async (
  _,
  { id }: GQL.IGetUserOnQueryArguments,
  { db },
) => {
  return await db.getRepository(User).findOne(id);
};
