import Store, { IPoolsState, IWeb3State } from '.';

export const setSafeAreaTop = (value: number) => {
  Store.update(s => {
    s.safeAreaTop = value;
  });
};

export const setWeb3State = (web3State: IWeb3State) => {
  Store.update(s => {
    s.web3 = web3State;
  });
};

export const setPoolsState = (poolsState: IPoolsState) => {
  Store.update(s => {
    s.pools = poolsState;
  });
};


