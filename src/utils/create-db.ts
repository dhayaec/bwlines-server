import { createConnection, getConnectionOptions } from 'typeorm';
import { Env } from '../constants';

export async function createDb() {
  const connectionOptions = await getConnectionOptions('root');
  const rootConnection = await createConnection({
    ...connectionOptions,
    name: 'default',
  });

  let dbName: string;

  if (process.env.NODE_ENV === Env.test) {
    dbName = process.env.DB_NAME_TEST as string;
  } else if (process.env.NODE_ENV === Env.development) {
    dbName = process.env.DB_NAME as string;
  } else {
    dbName = process.env.DB_NAME_PRODUCTION as string;
  }

  const grantQ =
    // tslint:disable-next-line:prefer-template
    'GRANT ALL ON ' + dbName + '.* TO `' + process.env.DB_USER + '`@`%`;';

  await rootConnection
    .query(`CREATE DATABASE IF NOT EXISTS ${dbName};`)
    .then(async () => {
      await rootConnection.query(grantQ);
      await rootConnection.close();
    });
}
