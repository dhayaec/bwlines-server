import { createError } from 'apollo-errors';

export const InputValidationError = createError('InputValidationError', {
  message: 'Validation failed',
});

export const AuthenticationError = createError('AuthenticationError', {
  message: 'Please login to continue',
});

export const AuthorizationError = createError('AuthorizationError', {
  message: 'You dont have permission to perform this operation',
});
