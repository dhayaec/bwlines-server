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
me: IUser | null;
}

interface IUser {
__typename: "User";
id: string;
name: string;
email: string;
password: string;
mobile: string;
}

interface IMutation {
__typename: "Mutation";
register: IUser | null;
login: IUser | null;
}

interface IRegisterOnMutationArguments {
name?: string | null;
email: string;
password: string;
mobile?: string | null;
}

interface ILoginOnMutationArguments {
email: string;
password: string;
}
}

// tslint:enable
