import { MarketPool } from '@/pool/Market.pool';
import Store, { IAppSettings, IPoolsState, IWeb3State } from '.';

export const setWeb3State = (web3State: IWeb3State) => {
  Store.update(s => {
    s.web3 = web3State;
  });
};
export const patchWeb3State = (web3State:  Partial<IWeb3State>) => {
  Store.update(s => {
    s.web3 = {
      ...s.web3,
      ...web3State
    }
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

export const patchMarketPoolsState = (marketsPools: MarketPool[]) => {
  Store.update(s => {
    s.pools.marketPools = [
      ...s.pools.marketPools,
      ...marketsPools
    ];
  });
};

export const setErrorState = (error?: Error) => {
  Store.update(s => {
    s.error = error;
  });
};

export const patchAppSettings = (appSettings: Partial<IAppSettings>) => {
  Store.update(s => {
    s.appSettings = {
      ...s.appSettings,
      ...appSettings
    };
  });
}