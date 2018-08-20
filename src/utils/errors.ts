import { createError } from 'apollo-errors';

export const InputValidationError = createError('InputValidationError', {
  message: 'Validation failed',
});
