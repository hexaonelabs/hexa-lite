import { ToChainNamePipe } from './to-chain-name.pipe';

describe('ToChainNamePipe', () => {
  it('create an instance', () => {
    const pipe = new ToChainNamePipe();
    expect(pipe).toBeTruthy();
  });
});
