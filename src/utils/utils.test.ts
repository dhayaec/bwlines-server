import { add } from './utils';

describe('utils', () => {
  describe('add', () => {
    it('add number', () => {
      expect(add(2, 2)).toEqual(4);
    });
  });
});
