import { ITEMS_PER_PAGE } from '../../constants';
import { User } from '../../entity/User';
import { checkAdminRights } from '../../utils/utils';
import { Resolver } from './../../typings/app-utility-types';

export const listUsers: Resolver = async (
  _,
  { isAdmin = false, page }: GQL.IListUsersOnQueryArguments,
  { db, session },
) => {
  checkAdminRights(session);

  const skip = page && page > 0 ? (page - 1) * ITEMS_PER_PAGE : 0;

  return await db.getRepository(User).find({
    skip,
    take: ITEMS_PER_PAGE,
    where: {
      isAdmin,
    },
  });
};
