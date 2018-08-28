// tslint:disable-next-line:no-var-requires
require('dotenv-safe').config();
import * as connectRedis from 'connect-redis';
import * as ExpressRateLimit from 'express-rate-limit';
import * as ExpressSession from 'express-session';
import { GraphQLServer } from 'graphql-yoga';
import * as helmet from 'helmet';
import * as IORedis from 'ioredis';
import * as RateLimitRedis from 'rate-limit-redis';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { Env, REDIS_SESSION_PREFIX, TokenTypes } from './constants';
import { seeder } from './seeder';
import { connectDb } from './utils/connect-db';
import { createDb } from './utils/create-db';
import { genSchema } from './utils/schema-utils';
import { confirmEmail, resetPassword } from './utils/user-utils';
import { formatError } from './utils/utils';

const RedisStore = connectRedis(ExpressSession as any);

export const redis = new IORedis();

export async function startServer() {
  if (process.env.NODE_ENV === Env.test) {
    await redis.flushall();
  }

  await createDb();

  const connection = await connectDb();

  if (process.env.NODE_ENV === Env.production) {
    await connection.runMigrations();
  }

  if (process.env.NODE_ENV !== Env.test) {
    await seeder(connection);
  }

  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      url: `${request.protocol}://${request.get('host')}`,
      session: request.session,
      db: connection,
      req: request,
    }),
  });

  const { express } = server;

  express.use(helmet());

  express.use(
    new ExpressRateLimit({
      store: new RateLimitRedis({
        client: redis,
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      delayMs: 0, // disable delaying - full speed until the max limit is reached
    }),
  );

  express.use(
    ExpressSession({
      store: new RedisStore({
        client: redis as any,
        prefix: REDIS_SESSION_PREFIX,
      }),
      name: 'qid',
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        // secure: process.env.NODE_ENV === Env.production,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    }),
  );

  express.get('/', (_, res) => res.json({ message: 'pong' }));
  express.get(`/${TokenTypes.confirm}/:id`, confirmEmail);
  express.get(`/${TokenTypes.reset}/:id`, resetPassword);

  const { NODE_ENV } = process.env;

  return server.start(
    {
      port: NODE_ENV === Env.test ? 4001 : 4000,
      formatError: (err: any) => formatError(err),
      playground: NODE_ENV === Env.production ? false : '/playground',
      endpoint: '/api',
    },
    ({ port }) => console.log('localhost:' + port),
  );
}
