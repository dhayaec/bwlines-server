import {
  formatError as formatApolloError,
  isInstance as isApolloErrorInstance,
} from 'apollo-errors';

// tslint:disable-next-line:no-var-requires
require('dotenv-safe').config();
import * as connectRedis from 'connect-redis';
import * as expressRateLimit from 'express-rate-limit';
import * as expressSession from 'express-session';
import { GraphQLServer } from 'graphql-yoga';
import * as helmet from 'helmet';
import * as ioredis from 'ioredis';
import * as rateLimitRedis from 'rate-limit-redis';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { Env, redisSessionPrefix } from './constants';
import { connectDb } from './utils/connect-db';
import { createDb } from './utils/create-db';
import { genSchema } from './utils/schema-utils';
const redisStore = connectRedis(expressSession as any);
const redis = new ioredis();

function formatError(error: any) {
  const { originalError } = error;
  if (isApolloErrorInstance(originalError)) {
    // log internalData to stdout but not include it in the formattedError
    console.log(
      JSON.stringify({
        type: `error`,
        data: originalError.data,
        internalData: originalError.internalData,
      }),
    );
  }
  return formatApolloError(error);
}

export async function startServer() {
  if (process.env.NODE_ENV === Env.test) {
    await redis.flushall();
  }

  await createDb();

  const db = process.env.NODE_ENV !== Env.test && (await connectDb());

  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      db,
      redis,
      url: `${request.protocol}://${request.get('host')}`,
      session: request.session,
      req: request,
    }),
  });

  server.express.use(helmet());

  server.express.use(
    new expressRateLimit({
      store: new rateLimitRedis({
        client: redis,
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      delayMs: 0, // disable delaying - full speed until the max limit is reached
    }),
  );

  server.express.use(
    expressSession({
      store: new redisStore({
        client: redis as any,
        prefix: redisSessionPrefix,
      }),
      name: 'qid',
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === Env.production,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    }),
  );

  server.express.get('/ping', (_, res) => res.json({ message: 'pong' }));

  return server.start(
    {
      port: process.env.NODE_ENV === Env.test ? 4001 : 4000,
      formatError: (err: any) => formatError(err),
    },
    ({ port }) => console.log('localhost:' + port),
  );
}
