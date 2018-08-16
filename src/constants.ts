export const redisSessionPrefix = 'sess:';
export const userSessionIdPrefix = 'userSids:';
export const forgotPasswordPrefix = 'forgotPassword:';

export enum Env {
  development = 'development',
  test = 'test',
  production = 'production',
}

export const errorResponse = [
  {
    path: 'email',
    message: 'invalid email',
  },
];