// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { Env, redisSessionPrefix } from './constants';
// tslint:disable-next-line:no-var-requires
require('dotenv-safe').config();
import * as connectRedis from 'connect-redis';
import * as expressRateLimit from 'express-rate-limit';
import * as expressSession from 'express-session';
import { GraphQLServer } from 'graphql-yoga';
import * as helmet from 'helmet';
import * as ioredis from 'ioredis';
import * as rateLimitRedis from 'rate-limit-redis';
import { genSchema } from './utils/schema-utils';

const redisStore = connectRedis(expressSession as any);
const redis = new ioredis();

export async function startServer() {
  if (process.env.NODE_ENV === Env.test) {
    await redis.flushall();
  }

  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
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
    })
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
    })
  );

  return server.start(
    { port: process.env.NODE_ENV === 'test' ? 4001 : 4000 },
    ({ port }) => console.log('localhost:' + port)
  );
}
