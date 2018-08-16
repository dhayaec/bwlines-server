import { Cart } from './entity/Cart';
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
import { Connection } from 'typeorm';
import { Env, redisSessionPrefix } from './constants';
import { Book } from './entity/Book';
import { Category } from './entity/Category';
import { User } from './entity/User';
import { connectDb, connectDbTest } from './utils/connect-db';
import { createDb } from './utils/create-db';
import { genSchema } from './utils/schema-utils';

const redisStore = connectRedis(expressSession as any);
const redis = new ioredis();

export async function startServer() {
  if (process.env.NODE_ENV === Env.test) {
    await redis.flushall();
  }

  await createDb();

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
  let connection: Connection;

  if (process.env.NODE_ENV === Env.test) {
    connection = await connectDbTest(true);
  } else {
    connection = await connectDb();
  }

  if (process.env.NODE_ENV !== Env.test) {
    const category = new Category();
    category.name = 'Science Fiction';
    const categoryRepository = connection.getRepository(Category);
    const categorySaved = await categoryRepository.save(category);

    const user = new User();
    user.name = 'dhaya';
    user.email = 'dhayaec@gmail.com';
    user.password = '123456';
    const userSaved = await connection.getRepository(User).save(user);

    const book = new Book();
    book.title = 'My Favorite book';
    book.isbn = '123123123';
    book.category = categorySaved;
    book.listPrice = 99.0;
    book.displayPrice = 70.0;
    const bookSaved = await connection.getRepository(Book).save(book);

    const cart = new Cart();
    cart.book = bookSaved;
    cart.title = bookSaved.title;
    cart.user = userSaved;
    const cartSaved = await connection.getRepository(Cart).save(cart);
    console.log(cartSaved);
  }

  return server.start(
    { port: process.env.NODE_ENV === Env.test ? 4001 : 4000 },
    ({ port }) => console.log('localhost:' + port)
  );
}
