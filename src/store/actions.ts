import Store, { IPoolsState, IWeb3State } from '.';

export const setWeb3State = (web3State: IWeb3State) => {
  Store.update(s => {
    s.web3 = web3State;
  });
};

export const patchPoolsState = (poolsState: Partial<IPoolsState>) => {
  Store.update(s => {
    s.pools ={ 
      ...s.pools,
      ...poolsState
    };
  });
};

export const setPoolsState = (poolsState: IPoolsState) => {
  Store.update(s => {
    s.pools = poolsState;
  });
};


