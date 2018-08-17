import { ValidationError } from 'yup';

export const add = (...args: number[]) => args.reduce((c, p) => c + p);

export const formatYupError = (err: ValidationError) => {
  const errors: [{path: string; message: string}] = [] as any;
  err.inner.forEach(e => {
    errors.push({
      path: e.path,
      message: e.message,
    });
  });
  return { errors };
};
