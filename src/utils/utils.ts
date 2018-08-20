import {
  formatError as formatApolloError,
  isInstance as isApolloErrorInstance,
} from 'apollo-errors';
import { ValidationError } from 'yup';

export const add = (...args: number[]) => args.reduce((c, p) => c + p);

export const formatYupError = (err: ValidationError) => {
  const errors: [{ path: string; message: string }] = [] as any;
  err.inner.forEach(e => {
    errors.push({
      path: e.path,
      message: e.message,
    });
  });
  return { errors };
};

export function formatError(error: any) {
  const { originalError } = error;
  if (isApolloErrorInstance(originalError)) {
    // log internalData to stdout but not include it in the formattedError
    console.log(
      JSON.stringify({
        type: `error`,
        data: originalError.data,
        internalData: originalError.internalData,
      }),
    );
  }
  return formatApolloError(error);
}
