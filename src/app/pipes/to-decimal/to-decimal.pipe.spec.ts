import { ToDecimalPipe } from './to-decimal.pipe';

describe('ToDecimalPipe', () => {
  it('create an instance', () => {
    const pipe = new ToDecimalPipe();
    expect(pipe).toBeTruthy();
  });
});
