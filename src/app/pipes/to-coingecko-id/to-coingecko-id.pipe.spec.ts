import { ToCoingeckoIdPipe } from './to-coingecko-id.pipe';

describe('ToCoingeckoIdPipe', () => {
  it('create an instance', () => {
    const pipe = new ToCoingeckoIdPipe();
    expect(pipe).toBeTruthy();
  });
});
