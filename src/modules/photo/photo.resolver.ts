import { ResolverMap } from '../../typings/graphql-utils';

export const resolvers: ResolverMap = {
  Query: {
    photos: () => {
      return [];
    },
    photo: (_, { id }: GQL.IPhotoOnQueryArguments) => {
      return {
        id,
        name: 'String!',
        description: 'String!',
        filename: 'String!',
        views: 0,
        isPublished: false,
      };
    },
  },
};
