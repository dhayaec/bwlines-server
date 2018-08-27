import { createError } from 'apollo-errors';

export const InputValidationError = createError('InputValidationError', {
  message: 'Validation failed',
});

export const AuthenticationError = createError('AuthenticationError', {
  message: 'Authentication Failed',
});

export const AuthorizationError = createError('AuthorizationError', {
  message: 'Authentication Failed',
});
