import { createError } from 'apollo-errors';

export const InputValidationError = createError('InputValidationError', {
  message: 'Validation failed',
});

export const AuthError = createError('AuthError', {
  message: 'Authentication Failed',
});
