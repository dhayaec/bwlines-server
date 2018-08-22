import { Redis } from 'ioredis';
import { v4 } from 'uuid';
import { ValidationError } from 'yup';
import {
  FORGOT_PASSWORD_PREFIX,
  REDIS_SESSION_PREFIX,
  USER_SESSION_PREFIX,
} from '../constants';
import { GraphQLMiddlewareFunc, Resolver } from '../typings/app-utility-types';

export const createForgotPasswordLink = async (
  url: string,
  userId: string,
  redis: Redis,
) => {
  const id = v4();
  await redis.set(`${FORGOT_PASSWORD_PREFIX}${id}`, userId, 'ex', 60 * 60);
  return `${url}/change-password/${id}`;
};

export const removeAllUsersSessions = async (userId: string, redis: Redis) => {
  const sessionIds = await redis.lrange(
    `${USER_SESSION_PREFIX}${userId}`,
    0,
    -1,
  );

  const promises = [];
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < sessionIds.length; i += 1) {
    promises.push(redis.del(`${REDIS_SESSION_PREFIX}${sessionIds[i]}`));
  }
  await Promise.all(promises);
};

export const formatYupError = (err: ValidationError) => {
  const errors: [{ path: string; message: string }] = [] as any;
  err.inner.forEach(e => {
    errors.push({
      path: e.path,
      message: e.message,
    });
  });

  return errors;
};

export const createMiddleware = (
  middlewareFunc: GraphQLMiddlewareFunc,
  resolverFunc: Resolver,
) => (parent: any, args: any, context: any, info: any) =>
  middlewareFunc(resolverFunc, parent, args, context, info);

export const middleware = async (
  resolver: Resolver,
  parent: any,
  args: any,
  context: any,
  info: any,
) => {
  return resolver(parent, args, context, info);
};
