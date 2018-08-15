import { createConnection, getConnectionOptions } from 'typeorm';
import { Env } from '../constants';

export async function createDb() {
  const connectionOptions = await getConnectionOptions('root');
  const rootConnection = await createConnection({
    ...connectionOptions,
    name: 'default',
  });

  const dbName =
    process.env.NODE_ENV === Env.test
      ? process.env.DB_NAME_TEST
      : process.env.DB_NAME;
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
