import {
  formatError as formatApolloError,
  isInstance as isApolloErrorInstance,
} from 'apollo-errors';
import * as nodemailer from 'nodemailer';
import slugify from 'slugify';
import { ValidationError } from 'yup';
import { Env } from '../constants';
import {
  AuthenticationError,
  AuthorizationError,
  InputValidationError,
} from './errors';

export const add = (...args: number[]) => args.reduce((c, p) => c + p);

export const formatYupError = (err: ValidationError) => {
  const errors: [{ path: string; message: string }] = [] as any;
  err.inner.forEach(e => {
    errors.push({
      path: e.path,
      message: e.message,
    });
  });
  return errors;
};

export function formatError(error: any) {
  const { originalError } = error;
  if (isApolloErrorInstance(originalError)) {
    // log internalData to stdout but not include it in the formattedError
    console.error(
      JSON.stringify({
        type: `error`,
        data: originalError.data,
        internalData: originalError.internalData,
      }),
    );
  }
  return formatApolloError(error);
}

export const makeSlug = (str: string) => slugify(str, { lower: true });

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: SendEmailParams) => {
  let mailConfig: any;
  if (process.env.NODE_ENV === Env.production) {
    mailConfig = {
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'real.user',
        pass: 'verysecret',
      },
    };
  } else {
    mailConfig = {
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    };
  }

  const transport = nodemailer.createTransport(mailConfig);

  try {
    const info = await transport.sendMail({
      to,
      subject,
      text,
      html,
    });

    console.log(nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
  return true;
};

export const checkAdminRights = (session: any) => {
  const { userId, isAdmin } = session;
  if (!userId) {
    throw new AuthenticationError();
  }
  if (!isAdmin) {
    throw new AuthorizationError();
  }
};

export const validateInputs = async (schema: any, inputs: any) => {
  try {
    await schema.validate(inputs, { abortEarly: false });
  } catch (err) {
    const errors = formatYupError(err);
    throw new InputValidationError({
      data: errors,
    });
  }
};
