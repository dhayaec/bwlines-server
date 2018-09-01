import * as ioredis from 'ioredis';
import { createForgotPasswordLink } from './user-utils';

let redis: ioredis.Redis;
beforeAll(async () => {
  redis = new ioredis();
});

describe('user-utils', () => {
  describe('createForgotPasswordLink', () => {
    it('should create Forgot password link', async () => {
      const link = await createForgotPasswordLink('example.com', '123', redis);
      expect(link).toContain('example.com/change-password');
    });
  });
});
