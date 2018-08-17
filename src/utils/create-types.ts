import { generateNamespace } from '@gql2ts/from-schema';
import * as fs from 'fs';
import * as path from 'path';
import { genSchema } from './schema-utils';

const typescriptTypes = generateNamespace('GQL', genSchema());

fs.writeFile(
  path.join(__dirname, '../typings/GQL/index.d.ts'),
  typescriptTypes,
  err => {
    console.error(err);
  },
);
