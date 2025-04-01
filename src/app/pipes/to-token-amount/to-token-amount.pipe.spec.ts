import { ToTokenAmountPipe } from './to-token-amount.pipe';

describe('ToTokenAmountPipe', () => {
  it('create an instance', () => {
    const pipe = new ToTokenAmountPipe();
    expect(pipe).toBeTruthy();
  });
});
