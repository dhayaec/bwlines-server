import * as bcryptjs from 'bcryptjs';
import { Env, TokenTypes } from '../../constants';
import { User } from '../../entity/User';
import { AuthenticationError } from '../../utils/errors';
import { createTokenLink } from '../../utils/user-utils';
import { Resolver } from './../../typings/app-utility-types';
import {
  ERROR_INVALID_TOKEN,
  ERROR_ITEM_NOT_FOUND,
  ERROR_PASSWORDS_DONT_MATCH,
} from './../../utils/errors';

export const resendVerifySignup: Resolver = async (
  _,
  __,
  { redis, session, url },
) => {
  const { userId } = session;

  if (!userId) {
    throw new AuthenticationError();
  }

  const confirmLink = await createTokenLink(
    url,
    userId,
    redis,
    TokenTypes.confirm,
  );

  console.log(confirmLink);
  if (process.env.NODE_ENV !== Env.test) {
    // const subject = 'Confirm your email address';
    // const message = `
    // <p>Please click on the link below to confirm your email address.</p>
    // <div>${confirmLink}</div>
    // `;
    // const emailHtml = renderEmail({
    //   subject,
    //   message,
    // });
    // await sendEmail({
    //   subject,
    //   to: userData.email,
    //   text: subject,
    //   html: emailHtml,
    // });
  }
  return true;
};

export const sendResetPassword: Resolver = async (
  _,
  { email },
  { redis, db, url },
) => {
  const user = await db.getRepository(User).findOne({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error(ERROR_ITEM_NOT_FOUND);
  }

  const { id: userId } = user;

  const resetLink = await createTokenLink(url, userId, redis, TokenTypes.reset);

  console.log(resetLink);

  if (process.env.NODE_ENV !== Env.test) {
    // const subject = 'Confirm your email address';
    // const message = `
    // <p>Please click on the link below to confirm your email address.</p>
    // <div>${confirmLink}</div>
    // `;
    // const emailHtml = renderEmail({
    //   subject,
    //   message,
    // });
    // await sendEmail({
    //   subject,
    //   to: userData.email,
    //   text: subject,
    //   html: emailHtml,
    // });
  }
  return true;
};

export const verifyResetPassword: Resolver = async (
  _,
  { token, password, confirmPassword },
  { redis, db },
) => {
  if (password !== confirmPassword) {
    throw new Error(ERROR_PASSWORDS_DONT_MATCH);
  }

  const userId = await redis.get(token);
  if (!userId) {
    throw new Error(ERROR_INVALID_TOKEN);
  }

  await redis.del(token);

  const user = await db.getRepository(User).findOne(userId);
  if (!user) {
    throw new Error(ERROR_ITEM_NOT_FOUND);
  }

  const hashedPassword = await bcryptjs.hash(password, 10);
  await db.getRepository(User).update(userId, { password: hashedPassword });
  // TODO send an alert email
  return user;
};
