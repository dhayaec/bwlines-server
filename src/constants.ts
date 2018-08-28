export const REDIS_SESSION_PREFIX = 'sess:';
export const USER_SESSION_PREFIX = 'userSids:';
export const FORGOT_PASSWORD_PREFIX = 'forgotPassword:';
export const ITEMS_PER_PAGE = 10;

export enum Env {
  development = 'development',
  test = 'test',
  production = 'production',
}

export enum TokenTypes {
  confirm = 'confirm',
  reset = 'reset',
}
