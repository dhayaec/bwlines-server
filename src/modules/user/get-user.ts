import { User } from '../../entity/User';
import { Resolver } from './../../typings/app-utility-types';

export const getUser: Resolver = async (
  _,
  { id }: GQL.IGetUserOnQueryArguments,
  { db },
) => {
  return await db.getRepository(User).findOne(id);
};
