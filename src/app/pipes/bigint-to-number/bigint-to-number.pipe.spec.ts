import { BigintToNumberPipe } from './bigint-to-number.pipe';

describe('BigintToNumberPipe', () => {
  it('create an instance', () => {
    const pipe = new BigintToNumberPipe();
    expect(pipe).toBeTruthy();
  });
});
