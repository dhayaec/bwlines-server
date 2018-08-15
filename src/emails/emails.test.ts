import { paragraphStyle, renderEmail } from './emails';

describe('email', () => {
  describe('renderEmail', () => {
    it('should correctly render message based on arguments', () => {
      const random = Math.random().toString();
      const email = renderEmail({
        subject: random,
        message: 'message' + random,
        salutation: 'Hello dude'
      });
      expect(email).toContain(paragraphStyle);
      expect(email).toContain(random);
      expect(email).toContain('message' + random);
      expect(email).toContain('Hello dude,');
    });
  });
});
