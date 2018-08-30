import { createError } from 'apollo-errors';

export const ERROR_VALIDATION_FAILED = 'Validation failed';
export const ERROR_PASSWORDS_DONT_MATCH = 'Passwords do not match';
export const ERROR_INVALID_TOKEN = 'Token is Invalid or Expired';
export const ERROR_INVALID_CATEGORY = 'Invalid Category';
export const ERROR_ITEM_NOT_FOUND = 'Item not found';
export const ERROR_USER_NOT_FOUND = 'User not found';
export const ERROR_INVALID_LOGIN = 'Invalid email or password';
export const ERROR_ALREADY_IN_CART = 'Already in Cart';
export const ERROR_EMPTY = 'Empty';
export const ERROR_LOGIN_TO_CONTINUE = 'Please login to continue';
export const ERROR_PERMISSION_DENIED =
  'You dont have permission to perform this operation';

export const InputValidationError = createError('InputValidationError', {
  message: ERROR_VALIDATION_FAILED,
});

export const AuthenticationError = createError('AuthenticationError', {
  message: ERROR_LOGIN_TO_CONTINUE,
});

export const AuthorizationError = createError('AuthorizationError', {
  message: ERROR_PERMISSION_DENIED,
});
