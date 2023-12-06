import { Store as PullStateStore } from 'pullstate';

export interface IStore  {
  safeAreaTop: number;
  safeAreaBottom: number;
}

const Store = new PullStateStore<IStore>({
  safeAreaTop: 0,
  safeAreaBottom: 0,
});

export default Store;
