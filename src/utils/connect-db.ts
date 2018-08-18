// tslint:disable-next-line:no-var-requires
const iconv = require('iconv-lite');
// tslint:disable-next-line:no-var-requires
const encodings = require('iconv-lite/encodings');
iconv.encodings = encodings;

import { createConnection, getConnectionOptions } from 'typeorm';

export const connectDb = async () => {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);

  return createConnection({
    ...connectionOptions,
    name: 'default',
  });
};

export const connectDbTest = async (resetDB: boolean = false) => {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);

  return createConnection({
    ...connectionOptions,
    name: 'default',
    synchronize: resetDB,
    dropSchema: resetDB,
  });
};
