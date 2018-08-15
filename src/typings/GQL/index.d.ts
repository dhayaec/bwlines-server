// tslint:disable
// graphql typescript definitions

declare namespace GQL {
interface IGraphQLResponseRoot {
data?: IQuery | IMutation;
errors?: Array<IGraphQLResponseError>;
}

interface IGraphQLResponseError {
/** Required for all errors */
message: string;
locations?: Array<IGraphQLResponseErrorLocation>;
/** 7.2.2 says 'GraphQL servers may provide additional entries to error' */
[propName: string]: any;
}

interface IGraphQLResponseErrorLocation {
line: number;
column: number;
}

interface IQuery {
__typename: "Query";
photos: Array<IPhoto>;
photo: IPhoto | null;
me: IUser | null;
getUser: IUser | null;
}

interface IPhotoOnQueryArguments {
id: string;
}

interface IGetUserOnQueryArguments {
id: string;
}

interface IPhoto {
__typename: "Photo";
id: string;
name: string;
description: string;
filename: string;
views: number;
isPublished: boolean;
}

interface IUser {
__typename: "User";
id: string;
name: string;
email: string;
password: string;
mobile: string | null;
}

interface IMutation {
__typename: "Mutation";
register: IUserResponse | null;
login: IUserResponse | null;
reset: IUserResponse | null;
logout: string | null;
}

interface IRegisterOnMutationArguments {
name: string;
email: string;
password: string;
mobile?: string | null;
}

interface ILoginOnMutationArguments {
email: string;
password: string;
}

interface IResetOnMutationArguments {
email: string;
}

interface IUserResponse {
__typename: "UserResponse";
id: string;
name: string;
email: string;
}
}

// tslint:enable
