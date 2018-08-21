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
listBooks: Array<IBookResponse> | null;
getBook: IBookResponse | null;
listCategories: Array<ICategoryResponse> | null;
me: IUserResponse | null;
getUser: IUserResponse | null;
animals: Array<IAnimal> | null;
}

interface IGetBookOnQueryArguments {
id: string;
}

interface IGetUserOnQueryArguments {
id: string;
}

interface IBookResponse {
__typename: "BookResponse";
id: string | null;
title: string | null;
slug: string | null;
coverImage: string | null;
isbn: string | null;
category: ICategoryResponse | null;
}

interface ICategoryResponse {
__typename: "CategoryResponse";
id: string | null;
name: string | null;
slug: string | null;
}

interface IUserResponse {
__typename: "UserResponse";
id: string | null;
name: string | null;
email: string | null;
mobile: string | null;
}

interface IAnimal {
__typename: "Animal";
kind: string;
}

interface IMutation {
__typename: "Mutation";
addBook: IBookResponse | null;
addCategory: ICategoryResponse | null;
register: IUserResponse | null;
login: IUserResponse | null;
reset: IUserResponse | null;
logout: string | null;
}

interface IAddBookOnMutationArguments {
title: string;
coverImage: string;
isbn: string;
description: string;
rating: number;
listPrice: number;
displayPrice: number;
datePublished: any;
categoryId: string;
}

interface IAddCategoryOnMutationArguments {
name: string;
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

interface IError {
__typename: "Error";
path: string;
message: string;
}

interface IUser {
__typename: "User";
id: string;
name: string;
email: string;
password: string;
mobile: string | null;
}
}

// tslint:enable
