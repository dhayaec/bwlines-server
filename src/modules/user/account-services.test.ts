import { graphql } from 'graphql';
import * as ioredis from 'ioredis';
import { Connection } from 'typeorm';
import { connectDbTest } from '../../utils/connect-db';
import { createDb } from '../../utils/create-db';
import { genSchema } from '../../utils/schema-utils';
import { user } from '../data';
import {
  ERROR_LOGIN_TO_CONTINUE,
  ERROR_PASSWORDS_DONT_MATCH,
  ERROR_USER_NOT_FOUND,
} from './../../utils/errors';

let connection: Connection;
let redis: ioredis.Redis;
let registerId: string;
let registeredEmail: string;

beforeAll(async () => {
  await createDb();
  redis = new ioredis();
  connection = await connectDbTest(true);
});

afterAll(async () => {
  connection.close();
});

const resendVerifySignup = {
  caseId: 'resendVerifySignup',
  query: `mutation{ resendVerifySignup }`,
  session: { userId: '123' },
  expectation: (result: any) => {
    expect(result.data.resendVerifySignup).toEqual(true);
  },
};

const resendVerifySignupWoLogin = {
  caseId: 'resendVerifySignup',
  query: `mutation{ resendVerifySignup }`,
  session: { userId: '' },
  expectation: (result: any) => {
    const error = result.errors;
    expect(error![0].message).toEqual(ERROR_LOGIN_TO_CONTINUE);
  },
};

const sendResetPasswordInvalidEmail = {
  caseId: 'sendResetPasswordInvalidEmail',
  query: `mutation{ sendResetPassword(email:"invalid") }`,
  session: { userId: '' },
  expectation: (result: any) => {
    const error = result.errors;
    expect(error![0].message).toEqual(ERROR_USER_NOT_FOUND);
  },
};

const registerUserValidData = {
  caseId: 'registerUserValidData',
  query: `mutation {
               register(name:"${user.name}", email: "${
    user.email
  }", password: "${user.password}") { email name id }}`,
  session: { userId: '' },
  expectation: (result: any) => {
    registerId = result.data!.register.id;
    registeredEmail = result.data!.register.email;
    expect(result.data!.register.email).toEqual(user.email);
  },
};

const sendResetPassword = (email: string, id: string) => {
  return {
    caseId: 'sendResetPassword',
    query: `mutation{ sendResetPassword(email:"${email}") }`,
    session: { userId: id },
    expectation: (result: any) => {
      expect(result).toEqual({ data: { sendResetPassword: true } });
    },
  };
};

const changePassword = (_: string, id: string) => {
  return {
    caseId: 'changePassword',
    query: `mutation{ changePassword(oldPassword:"123456",password:"1234567"){id} }`,
    session: { userId: id },
    expectation: (result: any) => {
      expect(result).toEqual({ data: { changePassword: { id } } });
    },
  };
};

const changePasswordInvalidOldPassword = (_: string, id: string) => {
  return {
    caseId: 'changePassword',
    query: `mutation{ changePassword(oldPassword:"invalid",password:"1234567"){id} }`,
    session: { userId: id },
    expectation: (result: any) => {
      const error = result.errors;
      expect(error![0].message).toEqual('Invalid old password');
    },
  };
};

const changePasswordWoLogin = {
  caseId: 'changePassword',
  query: `mutation{ changePassword(oldPassword:"123456",password:"1234567"){id} }`,
  session: { userId: '' },
  expectation: (result: any) => {
    const error = result.errors;
    expect(error![0].message).toEqual(ERROR_LOGIN_TO_CONTINUE);
  },
};

const changePasswordInvalidUser = {
  ...changePasswordWoLogin,
  caseId: 'changePasswordInvalidUser',
  session: { userId: '123' },
  expectation: (result: any) => {
    const error = result.errors;
    expect(error![0].message).toEqual(ERROR_USER_NOT_FOUND);
  },
};

const changeEmail = (_: string, id: string) => {
  return {
    caseId: 'changeEmail',
    query: `mutation{ changeEmail(email:"new@email.com"){email} }`,
    session: { userId: id },
    expectation: (result: any) => {
      expect(result).toEqual({
        data: { changeEmail: { email: 'new@email.com' } },
      });
    },
  };
};

const changeEmailSame = (_: string, id: string) => {
  return {
    caseId: 'changeEmail',
    query: `mutation{ changeEmail(email:"new@email.com"){email} }`,
    session: { userId: id },
    expectation: (result: any) => {
      const error = result.errors;
      expect(error![0].message).toEqual('New email is same as old one');
    },
  };
};

const changeEmailWoLogin = {
  caseId: 'changeEmail',
  query: `mutation{ changeEmail(email:"new@email.com"){email} }`,
  session: { userId: '' },
  expectation: (result: any) => {
    const error = result.errors;
    expect(error![0].message).toEqual(ERROR_LOGIN_TO_CONTINUE);
  },
};

const changeEmailInvalidUser = {
  ...changeEmailWoLogin,
  caseId: 'changeEmailInvalidUser',
  session: { userId: '123' },
  expectation: (result: any) => {
    const error = result.errors;
    expect(error![0].message).toEqual(ERROR_USER_NOT_FOUND);
  },
};
const verifyResetPassword = {
  query: `mutation{
    verifyResetPassword
    (token:"123",password:"password1",confirmPassword:"password2",)
    {email}}`,
  caseId: 'verifyResetPassword',
  session: { userId: '123' },
  expectation: (result: any) => {
    const error = result.errors;
    expect(error![0].message).toEqual(ERROR_PASSWORDS_DONT_MATCH);
  },
};

describe('account services', () => {
  const cases = [
    resendVerifySignup,
    resendVerifySignupWoLogin,
    sendResetPasswordInvalidEmail,
    registerUserValidData,
    sendResetPassword,
    changePassword,
    changePasswordInvalidOldPassword,
    changePasswordWoLogin,
    changePasswordInvalidUser,
    changeEmail,
    changeEmailSame,
    changeEmailWoLogin,
    changeEmailInvalidUser,
    verifyResetPassword,
  ];

  cases.forEach(c => {
    it(`case:`, async () => {
      const { query, expectation, session } =
        typeof c === 'function' ? c(registeredEmail, registerId) : c;

      const ctx = {
        redis,
        session,
        db: connection,
        url: 'http://localhost:4000',
        req: {},
      };

      const result = await graphql(genSchema(), query, null, ctx, {});

      if (result.errors && result.errors!.length) {
        // console.log(result.errors);
      }

      expectation(result);
    });
  });
});
