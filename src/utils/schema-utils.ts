import * as fs from 'fs';
import * as glob from 'glob';
import { makeExecutableSchema } from 'graphql-tools';
import { mergeResolvers, mergeTypes } from 'merge-graphql-schemas';
import * as path from 'path';

export function genSchema() {
  const pathToModules = path.join(__dirname, '../modules');

  const paths = glob.sync(`${pathToModules}/**/*.graphql`);
  const graphqlTypes = paths.map(x => fs.readFileSync(x, { encoding: 'utf8' }));
  const resolversList = glob
    .sync(`${pathToModules}/**/**.resolver.?s`)
    .map(resolver => require(resolver).resolvers);

  return makeExecutableSchema({
    typeDefs: mergeTypes(graphqlTypes),
    resolvers: mergeResolvers(resolversList),
  });
}
