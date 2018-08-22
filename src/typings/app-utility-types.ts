import { Redis } from 'ioredis';
import { Connection } from 'typeorm';

export interface Session extends Express.Session {
  userId?: string;
}

export interface Context {
  redis: Redis;
  url: string;
  session: Session;
  req: Express.Request;
  db: Connection;
}

export type Resolver = (
  parent: any,
  args: any,
  context: Context,
  info: any,
) => any;

export type GraphQLMiddlewareFunc = (
  resolver: Resolver,
  parent: any,
  args: any,
  context: Context,
  info: any,
) => any;

export interface AppResolverMap {
  [key: string]: {
    [key: string]: Resolver;
  };
}
